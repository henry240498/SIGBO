import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Between, DataSource } from 'typeorm';
import { EstadoReserva, Instalacion, ReservaInstalacion } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import {
  ActualizarInstalacionDto,
  CancelarReservaDto,
  CrearInstalacionDto,
  DecidirReservaDto,
  SolicitarReservaDto,
} from './dto/reservas.dto';

export interface ContextoReservas {
  usuarioId: string;
  puedeDecidir: boolean;
  ip?: string | null;
  userAgent?: string | null;
}

/** Una reserva no puede durar mas que esto: evita bloquear una sala "para siempre" por error. */
export const MAX_HORAS_RESERVA = 24 * 7;
const MAX_RANGO_DIAS = 366;

/** Dos intervalos [inicio, fin) se pisan si cada uno empieza antes de que el otro termine. */
export function seSuperponen(a: { inicio: Date; fin: Date }, b: { inicio: Date; fin: Date }): boolean {
  return new Date(a.inicio).getTime() < new Date(b.fin).getTime() && new Date(b.inicio).getTime() < new Date(a.fin).getTime();
}

@Injectable()
export class ReservasService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
  ) {}

  // ---------------- instalaciones ----------------

  listarInstalaciones(incluirInactivas = false) {
    return this.dataSource.getRepository(Instalacion).find({ where: incluirInactivas ? {} : { activo: true }, order: { nombre: 'ASC' } });
  }

  async crearInstalacion(dto: CrearInstalacionDto, ctx: ContextoReservas) {
    const repo = this.dataSource.getRepository(Instalacion);
    if ((await repo.find({})).some((i) => i.nombre.toLowerCase() === dto.nombre.toLowerCase())) {
      throw new ConflictException(`Ya existe una instalacion llamada "${dto.nombre}".`);
    }
    const i = await repo.save(repo.create({ nombre: dto.nombre, capacidad: dto.capacidad ?? null, descripcion: dto.descripcion ?? null, activo: true }));
    await this.auditar('CREAR_INSTALACION', 'organizacion.instalacion', i.id, null, { nombre: i.nombre }, ctx);
    return i;
  }

  async actualizarInstalacion(id: string, dto: ActualizarInstalacionDto, ctx: ContextoReservas) {
    const repo = this.dataSource.getRepository(Instalacion);
    const i = await repo.findOne({ where: { id } });
    if (!i) throw new NotFoundException('Instalacion no encontrada');
    const antes = { nombre: i.nombre, capacidad: i.capacidad, activo: i.activo };
    if (dto.nombre !== undefined) i.nombre = dto.nombre;
    if (dto.capacidad !== undefined) i.capacidad = dto.capacidad;
    if (dto.descripcion !== undefined) i.descripcion = dto.descripcion;
    if (dto.activo !== undefined) i.activo = dto.activo;
    const g = await repo.save(i);
    await this.auditar('ACTUALIZAR_INSTALACION', 'organizacion.instalacion', id, antes, { nombre: g.nombre, capacidad: g.capacidad, activo: g.activo }, ctx);
    return g;
  }

  // ---------------- reservas ----------------

  async solicitar(dto: SolicitarReservaDto, ctx: ContextoReservas) {
    const inicio = new Date(dto.inicio);
    const fin = new Date(dto.fin);
    if (fin.getTime() <= inicio.getTime()) throw new BadRequestException('El fin debe ser posterior al inicio.');
    if ((fin.getTime() - inicio.getTime()) / 3_600_000 > MAX_HORAS_RESERVA) {
      throw new BadRequestException(`Una reserva no puede durar mas de ${MAX_HORAS_RESERVA / 24} dias.`);
    }
    if (fin.getTime() < Date.now()) throw new BadRequestException('No se puede reservar en el pasado.');

    const instalacion = await this.dataSource.getRepository(Instalacion).findOne({ where: { id: dto.instalacionId } });
    if (!instalacion || !instalacion.activo) throw new NotFoundException('Instalacion no encontrada o dada de baja.');
    if (dto.personas && instalacion.capacidad && dto.personas > instalacion.capacidad) {
      throw new BadRequestException(`${instalacion.nombre} admite ${instalacion.capacidad} personas; se pidieron ${dto.personas}.`);
    }

    const repo = this.dataSource.getRepository(ReservaInstalacion);
    const reserva = await repo.save(
      repo.create({
        instalacionId: instalacion.id,
        titulo: dto.titulo,
        solicitanteNombre: dto.solicitanteNombre,
        contacto: dto.contacto ?? null,
        personas: dto.personas ?? null,
        inicio,
        fin,
        estado: 'SOLICITADA',
        motivoDecision: null,
        creadoPor: ctx.usuarioId,
        decididoPor: null,
        decididoEn: null,
      }),
    );
    await this.auditar('SOLICITAR', 'organizacion.reserva', reserva.id, null, { instalacion: instalacion.nombre, inicio, fin }, ctx);
    const aprobadas = await repo.find({ where: { instalacionId: instalacion.id, estado: 'APROBADA' } });
    return { ...reserva, conflictoConAprobada: aprobadas.some((a) => seSuperponen(a, reserva)) };
  }

  /** Aprobar o rechazar. Aprobar toma un bloqueo sobre la instalacion: dos aprobaciones simultaneas no se pisan. */
  async decidir(id: string, dto: DecidirReservaDto, ctx: ContextoReservas) {
    if (!ctx.puedeDecidir) throw new ForbiddenException('Decidir reservas requiere reservas:decidir.');
    if (dto.decision === 'RECHAZAR' && !dto.motivo) throw new BadRequestException('Indique el motivo del rechazo.');

    const { reserva, antes } = await this.dataSource.transaction(async (m) => {
      const repo = m.getRepository(ReservaInstalacion);
      const r = await repo.findOne({ where: { id } });
      if (!r) throw new NotFoundException('Reserva no encontrada');
      if (r.estado !== 'SOLICITADA') throw new ConflictException(`La reserva ya esta ${r.estado}.`);
      if (dto.decision === 'APROBAR') {
        await m.getRepository(Instalacion).findOne({ where: { id: r.instalacionId }, lock: { mode: 'pessimistic_write' } });
        const aprobadas = await repo.find({ where: { instalacionId: r.instalacionId, estado: 'APROBADA' } });
        const choque = aprobadas.find((a) => seSuperponen(a, r));
        if (choque) throw new ConflictException(`Se superpone con la reserva aprobada "${choque.titulo}".`);
      }
      const estadoAntes: EstadoReserva = r.estado;
      r.estado = dto.decision === 'APROBAR' ? 'APROBADA' : 'RECHAZADA';
      r.motivoDecision = dto.motivo ?? null;
      r.decididoPor = ctx.usuarioId;
      r.decididoEn = new Date();
      return { reserva: await repo.save(r), antes: estadoAntes };
    });
    await this.auditar(dto.decision, 'organizacion.reserva', id, { estado: antes }, { estado: reserva.estado, motivo: dto.motivo }, ctx);
    return reserva;
  }

  /** La cancela quien la pidio o quien puede decidir; una reserva ya rechazada o cancelada no se toca. */
  async cancelar(id: string, dto: CancelarReservaDto, ctx: ContextoReservas) {
    const repo = this.dataSource.getRepository(ReservaInstalacion);
    const r = await repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Reserva no encontrada');
    if (r.creadoPor !== ctx.usuarioId && !ctx.puedeDecidir) throw new ForbiddenException('Solo quien la pidio o quien decide reservas puede cancelarla.');
    if (r.estado !== 'SOLICITADA' && r.estado !== 'APROBADA') throw new ConflictException(`La reserva ya esta ${r.estado}.`);
    const antes = r.estado;
    r.estado = 'CANCELADA';
    r.motivoDecision = dto.motivo ?? r.motivoDecision;
    const g = await repo.save(r);
    await this.auditar('CANCELAR', 'organizacion.reserva', id, { estado: antes }, { estado: g.estado, motivo: dto.motivo }, ctx);
    return g;
  }

  async listar(filtros: { desde?: string; hasta?: string; estado?: string; instalacionId?: string }) {
    const where: Record<string, unknown> = {};
    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.instalacionId) where.instalacionId = filtros.instalacionId;
    if (filtros.desde && filtros.hasta) {
      const ini = new Date(`${filtros.desde}T00:00:00`);
      const fin = new Date(`${filtros.hasta}T23:59:59.999`);
      if (Number.isNaN(ini.getTime()) || Number.isNaN(fin.getTime()) || fin < ini) throw new BadRequestException('Rango de fechas invalido.');
      if ((fin.getTime() - ini.getTime()) / 86_400_000 > MAX_RANGO_DIAS) throw new BadRequestException(`El rango no puede superar ${MAX_RANGO_DIAS} dias.`);
      where.inicio = Between(ini, fin);
    }
    return this.dataSource.getRepository(ReservaInstalacion).find({ where, order: { inicio: 'ASC' }, take: 500 });
  }

  private auditar(accion: string, recurso: string, recursoId: string, antes: unknown, despues: unknown, ctx: ContextoReservas) {
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
