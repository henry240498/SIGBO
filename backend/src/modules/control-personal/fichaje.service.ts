import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { DataSource } from 'typeorm';
import { Fichaje, PuntoFichaje, TipoFichaje, Usuario } from '../../shared/entities';
import { instanteDelHecho } from '../../shared/utils/instante';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { ContextoPersonal } from './vencimientos.service';

/** Dos lecturas del mismo QR en menos de esto cuentan como una sola (doble escaneo). */
export const ANTIRREBOTE_SEGUNDOS = 60;
/** Una ENTRADA sin SALIDA de hace mas que esto se da por olvidada: el escaneo siguiente es otra ENTRADA. */
export const HORAS_MAXIMAS_DE_JORNADA = 20;

const hashDe = (token: string) => createHash('sha256').update(token).digest('hex');
const nuevoToken = () => randomBytes(24).toString('base64url');

/** Decide si el proximo fichaje es ENTRADA o SALIDA a partir del anterior del usuario. */
export function proximoTipo(anterior: { tipo: TipoFichaje; registradoEn: Date } | null, ahora: Date): TipoFichaje {
  if (!anterior || anterior.tipo === 'SALIDA') return 'ENTRADA';
  const horas = (ahora.getTime() - new Date(anterior.registradoEn).getTime()) / 3_600_000;
  return horas > HORAS_MAXIMAS_DE_JORNADA ? 'ENTRADA' : 'SALIDA';
}

@Injectable()
export class FichajeService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
  ) {}

  /** Crea un punto. El token del QR se devuelve UNA sola vez: despues solo existe su hash. */
  async crearPunto(nombre: string, ctx: ContextoPersonal) {
    const repo = this.dataSource.getRepository(PuntoFichaje);
    const token = nuevoToken();
    const punto = await repo.save(repo.create({ nombre, tokenHash: hashDe(token), activo: true, creadoPor: ctx.usuarioId }));
    await this.auditar('CREAR_PUNTO', punto.id, null, { nombre }, ctx);
    return { id: punto.id, nombre: punto.nombre, activo: punto.activo, token };
  }

  /** Invalida el QR anterior (por ejemplo si se fotografio y circula) y emite uno nuevo. */
  async regenerarToken(id: string, ctx: ContextoPersonal) {
    const repo = this.dataSource.getRepository(PuntoFichaje);
    const punto = await repo.findOne({ where: { id } });
    if (!punto) throw new NotFoundException('Punto de fichaje no encontrado');
    const token = nuevoToken();
    punto.tokenHash = hashDe(token);
    await repo.save(punto);
    await this.auditar('REGENERAR_TOKEN', id, null, { nombre: punto.nombre }, ctx);
    return { id: punto.id, nombre: punto.nombre, activo: punto.activo, token };
  }

  async actualizarPunto(id: string, cambios: { nombre?: string; activo?: boolean }, ctx: ContextoPersonal) {
    const repo = this.dataSource.getRepository(PuntoFichaje);
    const punto = await repo.findOne({ where: { id } });
    if (!punto) throw new NotFoundException('Punto de fichaje no encontrado');
    const antes = { nombre: punto.nombre, activo: punto.activo };
    if (cambios.nombre !== undefined) punto.nombre = cambios.nombre;
    if (cambios.activo !== undefined) punto.activo = cambios.activo;
    await repo.save(punto);
    await this.auditar('ACTUALIZAR_PUNTO', id, antes, { nombre: punto.nombre, activo: punto.activo }, ctx);
    return { id: punto.id, nombre: punto.nombre, activo: punto.activo };
  }

  async listarPuntos() {
    const filas = await this.dataSource.getRepository(PuntoFichaje).find({ order: { nombre: 'ASC' } });
    // el hash nunca sale de aqui
    return filas.map((p) => ({ id: p.id, nombre: p.nombre, activo: p.activo, creadoEn: p.creadoEn }));
  }

  /** El bombero escanea el QR de la puerta con la camara del celular. */
  async escanear(token: string, usuarioId: string, ahora: Date = new Date(), ocurridoEn?: string) {
    // Con conexion: la hora del servidor. Sin conexion: la hora del escaneo, acotada.
    ahora = instanteDelHecho(ocurridoEn, ahora);
    const punto = await this.dataSource.getRepository(PuntoFichaje).findOne({ where: { tokenHash: hashDe(token), activo: true } });
    if (!punto) throw new ForbiddenException('El codigo QR no es valido o fue dado de baja.');

    const usuario = await this.dataSource.getRepository(Usuario).findOne({ where: { id: usuarioId } });
    const fichajes = this.dataSource.getRepository(Fichaje);
    const anteriores = await fichajes.find({ where: { usuarioId }, order: { registradoEn: 'DESC' }, take: 1 });
    const anterior = anteriores[0] ?? null;

    if (anterior) {
      const seg = (ahora.getTime() - new Date(anterior.registradoEn).getTime()) / 1000;
      if (seg >= 0 && seg < ANTIRREBOTE_SEGUNDOS) {
        return { duplicado: true, tipo: anterior.tipo, registradoEn: anterior.registradoEn, punto: punto.nombre };
      }
    }
    const tipo = proximoTipo(anterior, ahora);
    const guardado = await fichajes.save(
      fichajes.create({ puntoId: punto.id, usuarioId, bomberoId: usuario?.bomberoId ?? null, tipo, registradoEn: ahora }),
    );
    await this.auditar('FICHAR', guardado.id, null, { tipo, punto: punto.nombre }, { usuarioId });
    return { duplicado: false, tipo, registradoEn: guardado.registradoEn, punto: punto.nombre };
  }

  async misFichajes(usuarioId: string, limite = 20) {
    return this.dataSource.getRepository(Fichaje).find({ where: { usuarioId }, order: { registradoEn: 'DESC' }, take: Math.min(Math.max(limite, 1), 200) });
  }

  /** Fichajes de un dia (AAAA-MM-DD, hora local del servidor), con el nombre del usuario. */
  async deFecha(fecha: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw new ConflictException('La fecha debe ser AAAA-MM-DD.');
    const inicio = new Date(`${fecha}T00:00:00`);
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + 1);
    const todos = await this.dataSource.getRepository(Fichaje).find({ order: { registradoEn: 'ASC' } });
    const delDia = todos.filter((f) => new Date(f.registradoEn) >= inicio && new Date(f.registradoEn) < fin);
    const usuarios = this.dataSource.getRepository(Usuario);
    const nombres = new Map<string, string>();
    for (const f of delDia) {
      if (!nombres.has(f.usuarioId)) {
        const u = await usuarios.findOne({ where: { id: f.usuarioId } });
        nombres.set(f.usuarioId, u?.username ?? '?');
      }
    }
    return delDia.map((f) => ({ id: f.id, usuario: nombres.get(f.usuarioId), tipo: f.tipo, registradoEn: f.registradoEn }));
  }

  private auditar(accion: string, recursoId: string, antes: unknown, despues: unknown, ctx: { usuarioId: string; ip?: string | null; userAgent?: string | null }) {
    return this.auditoria.registrar({
      usuarioId: ctx.usuarioId,
      accion,
      recurso: 'operaciones.fichaje',
      recursoId,
      datosAntes: antes ?? undefined,
      datosDespues: despues,
      ip: ctx.ip ?? null,
      userAgent: ctx.userAgent ?? null,
    });
  }
}
