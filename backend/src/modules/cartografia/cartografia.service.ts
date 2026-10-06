import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Hidrante, Preplan, PuntoRiesgo } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import {
  ActualizarHidranteDto,
  ActualizarPuntoRiesgoDto,
  CrearHidranteDto,
  CrearPuntoRiesgoDto,
  GuardarPreplanDto,
} from './dto/cartografia.dto';
import { masCercanos } from './geo.util';

export interface ContextoCarto {
  usuarioId: string;
  ip?: string | null;
  userAgent?: string | null;
}

/** Aplica solo los campos presentes (undefined = no tocar). */
function aplicar<T extends object>(destino: T, cambios: Partial<Record<keyof T, unknown>>) {
  for (const [k, v] of Object.entries(cambios)) {
    if (v !== undefined) (destino as Record<string, unknown>)[k] = v;
  }
}

@Injectable()
export class CartografiaService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
  ) {}

  // ---------------- hidrantes ----------------

  async listarHidrantes(filtros: { estado?: string; incluirInactivos?: boolean }) {
    const where: Record<string, unknown> = {};
    if (!filtros.incluirInactivos) where.activo = true;
    if (filtros.estado) where.estado = filtros.estado;
    const filas = await this.dataSource.getRepository(Hidrante).find({ where, order: { codigo: 'ASC' } });
    return filas.map((h) => this.numerico(h));
  }

  async crearHidrante(dto: CrearHidranteDto, ctx: ContextoCarto) {
    const repo = this.dataSource.getRepository(Hidrante);
    if (await repo.findOne({ where: { codigo: dto.codigo } })) {
      throw new ConflictException(`Ya existe un hidrante con el codigo ${dto.codigo}.`);
    }
    const h = await repo.save(
      repo.create({
        codigo: dto.codigo,
        direccion: dto.direccion,
        latitud: dto.latitud,
        longitud: dto.longitud,
        tipo: dto.tipo ?? null,
        referencia: dto.referencia ?? null,
        estado: dto.estado ?? 'SIN_VERIFICAR',
        caudalLpm: dto.caudalLpm ?? null,
        ultimaInspeccion: dto.ultimaInspeccion ?? null,
        observaciones: dto.observaciones ?? null,
        activo: true,
        creadoPor: ctx.usuarioId,
      }),
    );
    await this.auditar('CREAR', 'servicios.hidrante', h.id, null, { codigo: h.codigo, direccion: h.direccion }, ctx);
    return this.numerico(h);
  }

  async actualizarHidrante(id: string, dto: ActualizarHidranteDto, ctx: ContextoCarto) {
    const repo = this.dataSource.getRepository(Hidrante);
    const h = await repo.findOne({ where: { id } });
    if (!h) throw new NotFoundException('Hidrante no encontrado');
    const antes = { estado: h.estado, activo: h.activo, latitud: h.latitud, longitud: h.longitud };
    aplicar(h, { ...dto });
    const guardado = await repo.save(h);
    await this.auditar(
      dto.activo === false ? 'BAJA' : 'ACTUALIZAR',
      'servicios.hidrante',
      id,
      antes,
      { estado: guardado.estado, activo: guardado.activo, cambios: Object.keys(dto) },
      ctx,
    );
    return this.numerico(guardado);
  }

  // ---------------- puntos de riesgo ----------------

  async listarPuntos(filtros: { incluirInactivos?: boolean }) {
    const filas = await this.dataSource.getRepository(PuntoRiesgo).find({
      where: filtros.incluirInactivos ? {} : { activo: true },
      order: { nombre: 'ASC' },
    });
    return filas.map((p) => this.numerico(p));
  }

  async crearPunto(dto: CrearPuntoRiesgoDto, ctx: ContextoCarto) {
    const repo = this.dataSource.getRepository(PuntoRiesgo);
    const p = await repo.save(
      repo.create({
        nombre: dto.nombre,
        direccion: dto.direccion,
        latitud: dto.latitud,
        longitud: dto.longitud,
        nivelRiesgo: dto.nivelRiesgo ?? 'MEDIO',
        categoria: dto.categoria ?? null,
        contactoNombre: dto.contactoNombre ?? null,
        contactoTelefono: dto.contactoTelefono ?? null,
        descripcion: dto.descripcion ?? null,
        activo: true,
        creadoPor: ctx.usuarioId,
      }),
    );
    await this.auditar('CREAR', 'servicios.punto_riesgo', p.id, null, { nombre: p.nombre, nivelRiesgo: p.nivelRiesgo }, ctx);
    return this.numerico(p);
  }

  async actualizarPunto(id: string, dto: ActualizarPuntoRiesgoDto, ctx: ContextoCarto) {
    const repo = this.dataSource.getRepository(PuntoRiesgo);
    const p = await repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Punto de riesgo no encontrado');
    const antes = { nivelRiesgo: p.nivelRiesgo, activo: p.activo };
    aplicar(p, { ...dto });
    const guardado = await repo.save(p);
    await this.auditar(
      dto.activo === false ? 'BAJA' : 'ACTUALIZAR',
      'servicios.punto_riesgo',
      id,
      antes,
      { nivelRiesgo: guardado.nivelRiesgo, activo: guardado.activo, cambios: Object.keys(dto) },
      ctx,
    );
    return this.numerico(guardado);
  }

  // ---------------- pre-planes ----------------

  /** Pre-plan vigente del punto, o null si todavia no tiene. */
  async preplanVigente(puntoId: string) {
    await this.obtenerPunto(puntoId);
    return (await this.dataSource.getRepository(Preplan).findOne({ where: { puntoRiesgoId: puntoId, vigente: true } })) ?? null;
  }

  async historialPreplan(puntoId: string) {
    await this.obtenerPunto(puntoId);
    return this.dataSource.getRepository(Preplan).find({ where: { puntoRiesgoId: puntoId }, order: { version: 'DESC' } });
  }

  /** Editar un pre-plan NUNCA pisa el anterior: crea la version siguiente y la deja vigente. */
  async guardarPreplan(puntoId: string, dto: GuardarPreplanDto, ctx: ContextoCarto) {
    const punto = await this.obtenerPunto(puntoId);
    if (!punto.activo) throw new ConflictException('El punto de riesgo esta dado de baja.');
    const repo = this.dataSource.getRepository(Preplan);
    const previas = await repo.find({ where: { puntoRiesgoId: puntoId }, order: { version: 'DESC' } });
    const vigente = previas.find((p) => p.vigente);
    if (vigente && vigente.titulo === dto.titulo && vigente.contenido === dto.contenido) {
      throw new BadRequestException('El contenido no cambio respecto de la version vigente.');
    }
    if (vigente) {
      vigente.vigente = false;
      await repo.save(vigente);
    }
    const nueva = await repo.save(
      repo.create({
        puntoRiesgoId: puntoId,
        version: (previas[0]?.version ?? 0) + 1,
        titulo: dto.titulo,
        contenido: dto.contenido,
        vigente: true,
        creadoPor: ctx.usuarioId,
      }),
    );
    await this.auditar('NUEVA_VERSION', 'servicios.preplan', nueva.id, vigente ? { version: vigente.version } : null, { puntoRiesgoId: puntoId, version: nueva.version }, ctx);
    return nueva;
  }

  // ---------------- consulta por cercania ----------------

  /** Hidrantes operativos y puntos de riesgo cerca de un lugar (para un servicio en curso). */
  async cercanos(lat: number, lon: number, radioM: number) {
    const [hidrantes, puntos] = await Promise.all([
      this.dataSource.getRepository(Hidrante).find({ where: { activo: true } }),
      this.dataSource.getRepository(PuntoRiesgo).find({ where: { activo: true } }),
    ]);
    return {
      hidrantes: masCercanos(hidrantes.map((h) => this.numerico(h)), lat, lon, radioM, 10),
      puntosRiesgo: masCercanos(puntos.map((p) => this.numerico(p)), lat, lon, radioM, 10),
    };
  }

  // ---------------- internos ----------------

  private async obtenerPunto(id: string) {
    const p = await this.dataSource.getRepository(PuntoRiesgo).findOne({ where: { id } });
    if (!p) throw new NotFoundException('Punto de riesgo no encontrado');
    return p;
  }

  /** SQL Server devuelve los DECIMAL como texto en algunos drivers: se normalizan. */
  private numerico<T extends { latitud: number; longitud: number }>(fila: T): T {
    return { ...fila, latitud: Number(fila.latitud), longitud: Number(fila.longitud) };
  }

  private auditar(accion: string, recurso: string, recursoId: string, antes: unknown, despues: unknown, ctx: ContextoCarto) {
    return this.auditoria.registrar({
      usuarioId: ctx.usuarioId,
      accion,
      recurso,
      recursoId,
      datosAntes: antes ?? undefined,
      datosDespues: despues,
      ip: ctx.ip ?? null,
      userAgent: ctx.userAgent ?? null,
    });
  }
}
