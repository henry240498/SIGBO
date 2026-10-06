import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  Aptitud,
  Bombero,
  Certificacion,
  Equipo,
  PrestamoEquipo,
  VehiculoAutorizado,
} from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { ActualizarAptitudDto, CrearAptitudDto } from './dto/control-personal.dto';

export interface ContextoPersonal {
  usuarioId: string;
  ip?: string | null;
  userAgent?: string | null;
}

export type OrigenVencimiento = 'APTITUD' | 'CERTIFICACION' | 'AUTORIZACION_VEHICULO' | 'EQUIPO';

export interface Vencimiento {
  origen: OrigenVencimiento;
  bomberoId: string;
  bombero: string;
  descripcion: string;
  fecha: string;
  vencido: boolean;
  diasRestantes: number;
}

const DIA_MS = 86_400_000;
const soloFecha = (v: unknown) => String(v).slice(0, 10);

/** Dias enteros entre dos fechas AAAA-MM-DD (negativo si ya paso). */
export function diasHasta(fecha: string, hoy: string): number {
  return Math.round((Date.parse(`${soloFecha(fecha)}T00:00:00Z`) - Date.parse(`${hoy}T00:00:00Z`)) / DIA_MS);
}

@Injectable()
export class VencimientosService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
  ) {}

  // ---------------- aptitudes ----------------

  async crearAptitud(dto: CrearAptitudDto, ctx: ContextoPersonal) {
    const bombero = await this.dataSource.getRepository(Bombero).findOne({ where: { id: dto.bomberoId } });
    if (!bombero) throw new NotFoundException('Bombero no encontrado');
    if (dto.emitidoEn && dto.emitidoEn.slice(0, 10) > dto.venceEn.slice(0, 10)) {
      throw new BadRequestException('La fecha de emision no puede ser posterior al vencimiento.');
    }
    const repo = this.dataSource.getRepository(Aptitud);
    const a = await repo.save(
      repo.create({
        bomberoId: dto.bomberoId,
        categoria: dto.categoria,
        tipo: dto.tipo,
        emitidoEn: dto.emitidoEn ? soloFecha(dto.emitidoEn) : null,
        venceEn: soloFecha(dto.venceEn),
        observacion: dto.observacion ?? null,
        activo: true,
        creadoPor: ctx.usuarioId,
      }),
    );
    await this.auditar('CREAR', a.id, null, { bomberoId: a.bomberoId, categoria: a.categoria, tipo: a.tipo, venceEn: a.venceEn }, ctx);
    return a;
  }

  async actualizarAptitud(id: string, dto: ActualizarAptitudDto, ctx: ContextoPersonal) {
    const repo = this.dataSource.getRepository(Aptitud);
    const a = await repo.findOne({ where: { id } });
    if (!a) throw new NotFoundException('Aptitud no encontrada');
    const antes = { tipo: a.tipo, venceEn: a.venceEn, activo: a.activo };
    if (dto.tipo !== undefined) a.tipo = dto.tipo;
    if (dto.venceEn !== undefined) a.venceEn = soloFecha(dto.venceEn);
    if (dto.emitidoEn !== undefined) a.emitidoEn = soloFecha(dto.emitidoEn);
    if (dto.observacion !== undefined) a.observacion = dto.observacion;
    if (dto.activo !== undefined) a.activo = dto.activo;
    if (a.emitidoEn && a.emitidoEn > a.venceEn) {
      throw new BadRequestException('La fecha de emision no puede ser posterior al vencimiento.');
    }
    const guardada = await repo.save(a);
    await this.auditar(dto.activo === false ? 'BAJA' : 'ACTUALIZAR', id, antes, { tipo: guardada.tipo, venceEn: guardada.venceEn, activo: guardada.activo }, ctx);
    return guardada;
  }

  async categoriaDe(id: string): Promise<string | null> {
    return (await this.dataSource.getRepository(Aptitud).findOne({ where: { id } }))?.categoria ?? null;
  }

  async listarAptitudes(bomberoId: string, incluirMedicas: boolean) {
    const filas = await this.dataSource.getRepository(Aptitud).find({ where: { bomberoId, activo: true }, order: { venceEn: 'ASC' } });
    return filas.filter((a) => incluirMedicas || a.categoria !== 'MEDICA');
  }

  // ---------------- vencimientos consolidados ----------------

  /**
   * Todo lo que vence (o ya vencio) dentro de `dias`: aptitudes, certificaciones,
   * autorizaciones de conduccion y equipos prestados. Las aptitudes MEDICAS solo
   * se incluyen si el usuario puede ver datos medicos.
   */
  async vencimientos(dias: number, opciones: { incluirMedicas: boolean; hoy?: Date }): Promise<Vencimiento[]> {
    const ahora = opciones.hoy ?? new Date();
    const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
    const limite = diasHasta(hoy, hoy) + dias;

    const nombres = new Map<string, string>();
    for (const b of await this.dataSource.getRepository(Bombero).find({})) nombres.set(b.id, `${b.apellido}, ${b.nombre}`);
    const nombre = (id: string) => nombres.get(id) ?? 'Sin ficha';

    const salida: Vencimiento[] = [];
    const agregar = (origen: OrigenVencimiento, bomberoId: string, descripcion: string, fecha: unknown) => {
      if (!fecha) return;
      const f = soloFecha(fecha);
      const d = diasHasta(f, hoy);
      if (d > limite) return;
      salida.push({ origen, bomberoId, bombero: nombre(bomberoId), descripcion, fecha: f, vencido: d < 0, diasRestantes: d });
    };

    for (const a of await this.dataSource.getRepository(Aptitud).find({ where: { activo: true } })) {
      if (a.categoria === 'MEDICA' && !opciones.incluirMedicas) continue;
      agregar('APTITUD', a.bomberoId, a.tipo, a.venceEn);
    }
    for (const c of await this.dataSource.getRepository(Certificacion).find({})) {
      if (c.estado === 'EN_PROCESO') continue;
      agregar('CERTIFICACION', c.bomberoId, c.nombre, c.fechaVencimiento);
    }
    for (const v of await this.dataSource.getRepository(VehiculoAutorizado).find({})) {
      agregar('AUTORIZACION_VEHICULO', v.bomberoId, `Autorizacion de conduccion${v.categoria ? ` (${v.categoria})` : ''}`, v.vigencia);
    }
    // Equipos (EPP) hoy en manos de un bombero.
    const prestados = (await this.dataSource.getRepository(PrestamoEquipo).find({ where: { estado: 'PRESTADO' } })).filter((p) => p.bomberoId);
    const equipoRepo = this.dataSource.getRepository(Equipo);
    for (const p of prestados) {
      const e = await equipoRepo.findOne({ where: { id: p.equipoId } });
      if (e) agregar('EQUIPO', p.bomberoId!, `Equipo ${e.nombre}`, e.fechaVencimiento);
    }

    return salida.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.bombero.localeCompare(b.bombero));
  }

  private auditar(accion: string, recursoId: string, antes: unknown, despues: unknown, ctx: ContextoPersonal) {
    return this.auditoria.registrar({
      usuarioId: ctx.usuarioId,
      accion,
      recurso: 'personal.aptitud',
      recursoId,
      datosAntes: antes ?? undefined,
      datosDespues: despues,
      ip: ctx.ip ?? null,
      userAgent: ctx.userAgent ?? null,
    });
  }
}
