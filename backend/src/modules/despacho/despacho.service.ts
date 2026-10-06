import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, IsNull } from 'typeorm';
import {
  DisponibilidadExcepcion,
  DisponibilidadHorario,
  DisponibilidadPersonal,
  SolicitudDespacho,
  SolicitudDestinatario,
  SolicitudEvento,
  Servicio,
  ServicioParticipante,
  SolicitudMovil,
  Usuario,
  Vehiculo,
  VehiculoAutorizado,
} from '../../shared/entities';
import type { EstadoPersonal } from '../../shared/entities';
import { instanteDelHecho } from '../../shared/utils/instante';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { PolicyEngineService } from '../seguridad/policy-engine.service';
import {
  CambiarDisponibilidadDto,
  CerrarSolicitudDto,
  CrearExcepcionDto,
  CrearSolicitudDto,
  GuardarHorariosDto,
  ResponderDto,
} from './dto/despacho.dto';
import { DespachoTiempoReal } from './despacho-tiempo-real.service';
import {
  agruparSeguimiento,
  disponiblePorHorario,
  estadoEfectivo,
  estadoPersonalTras,
  estaEnLinea,
  evaluarEntrega,
  exigirMotivo,
  siguienteEstado,
  textoSolicitud,
} from './despacho.logica';

export interface ContextoDespacho {
  usuarioId: string;
  username: string;
  ip?: string | null;
  userAgent?: string | null;
}

/** Cuanto dura el AL_LLAMADO temporal de quien acepta sumarse por "Buscar personal adicional". */
export const horasTemporal = () => {
  const n = Number(process.env.DESPACHO_TEMPORAL_HORAS ?? 4);
  return Number.isFinite(n) && n > 0 && n <= 24 ? n : 4;
};

const etiquetaMovil = (v: Pick<Vehiculo, 'numeroInterno' | 'alias'>) => `Móvil ${v.numeroInterno}${v.alias ? ` — ${v.alias}` : ''}`;

@Injectable()
export class DespachoService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
    private readonly policy: PolicyEngineService,
    private readonly tiempoReal: DespachoTiempoReal,
  ) {}

  // ------------------------------------------------------------ utilidades

  private async evento(
    solicitudId: string,
    tipo: string,
    actor: { id?: string | null; nombre?: string | null },
    destinatarioId: string | null,
    detalle: unknown,
    ocurrido: Date,
    registrado: Date,
    manager?: EntityManager,
  ) {
    const repo = (manager ?? this.dataSource.manager).getRepository(SolicitudEvento);
    await repo.save(
      repo.create({
        solicitudId,
        actorId: actor.id ?? null,
        actorNombre: actor.nombre ?? null,
        destinatarioId,
        tipo,
        detalle: detalle === undefined || detalle === null ? null : JSON.stringify(detalle),
        ocurridoEn: ocurrido,
        registradoEn: registrado,
      }),
    );
  }

  private auditar(accion: string, recursoId: string, antes: unknown, despues: unknown, ctx: ContextoDespacho, manager?: EntityManager) {
    return this.auditoria.registrar({
      usuarioId: ctx.usuarioId,
      accion,
      recurso: 'servicios.despacho',
      recursoId,
      datosAntes: antes ?? undefined,
      datosDespues: despues,
      ip: ctx.ip ?? null,
      userAgent: ctx.userAgent ?? null,
    }, manager);
  }

  private async disponibilidadDe(usuarioId: string, ahora: Date, manager?: EntityManager): Promise<DisponibilidadPersonal> {
    const repo = (manager ?? this.dataSource.manager).getRepository(DisponibilidadPersonal);
    const existente = await repo.findOne({
      where: { usuarioId },
      ...(manager ? { lock: { mode: 'pessimistic_write' as const } } : {}),
    });
    if (existente) return existente;
    return repo.save(
      repo.create({ usuarioId, estado: 'NO_DISPONIBLE', desde: ahora, solicitudId: null, usaHorario: false, temporalHasta: null, ultimaActividad: null, version: 0, actualizadoEn: ahora }),
    );
  }

  // ------------------------------------------------------------ disponibilidad

  async miDisponibilidad(usuarioId: string, ahora = new Date()) {
    const d = await this.disponibilidadDe(usuarioId, ahora);
    const horarios = await this.dataSource.getRepository(DisponibilidadHorario).find({ where: { usuarioId } });
    const excepciones = await this.dataSource.getRepository(DisponibilidadExcepcion).find({ where: { usuarioId } });
    const enHorario = disponiblePorHorario(d.usaHorario, horarios, excepciones, ahora);
    return {
      estado: estadoEfectivo(d.estado, d.temporalHasta, ahora),
      estadoDeclarado: d.estado,
      desde: d.desde,
      temporalHasta: d.temporalHasta,
      usaHorario: d.usaHorario,
      enHorarioAhora: enHorario,
      solicitudId: d.solicitudId,
      horarios: horarios.map((h) => ({ diaSemana: h.diaSemana, horaDesde: String(h.horaDesde).slice(0, 5), horaHasta: String(h.horaHasta).slice(0, 5) })),
      excepciones,
    };
  }

  async cambiarDisponibilidad(dto: CambiarDisponibilidadDto, ctx: ContextoDespacho, ahora = new Date()) {
    const d = await this.disponibilidadDe(ctx.usuarioId, ahora);
    const efectivo = estadoEfectivo(d.estado, d.temporalHasta, ahora);
    if (efectivo === 'EN_CAMINO' || efectivo === 'EN_SERVICIO') {
      throw new ConflictException('Estás en camino o en servicio: cancelá o finalizá antes de cambiar tu disponibilidad.');
    }
    const r = await this.dataSource.getRepository(DisponibilidadPersonal).update(
      { id: d.id, version: d.version },
      { estado: dto.estado, desde: ahora, temporalHasta: null, usaHorario: dto.usaHorario ?? d.usaHorario, version: d.version + 1, actualizadoEn: ahora },
    );
    if (!r.affected) throw new ConflictException('Tu disponibilidad cambió desde otro dispositivo. Volvé a intentarlo.');
    await this.auditar('CAMBIAR_DISPONIBILIDAD', d.id, { estado: efectivo }, { estado: dto.estado, usaHorario: dto.usaHorario ?? d.usaHorario }, ctx);
    this.tiempoReal.emitir({ tipo: 'disponibilidad', para: [ctx.usuarioId], datos: { estado: dto.estado } });
    return this.miDisponibilidad(ctx.usuarioId, ahora);
  }

  async guardarHorarios(dto: GuardarHorariosDto, ctx: ContextoDespacho, ahora = new Date()) {
    for (const f of dto.franjas) {
      if (f.horaDesde === f.horaHasta) throw new BadRequestException('Una franja no puede empezar y terminar a la misma hora.');
    }
    const repo = this.dataSource.getRepository(DisponibilidadHorario);
    const antes = await repo.find({ where: { usuarioId: ctx.usuarioId } });
    await repo.delete({ usuarioId: ctx.usuarioId });
    for (const f of dto.franjas) await repo.save(repo.create({ usuarioId: ctx.usuarioId, diaSemana: f.diaSemana, horaDesde: f.horaDesde, horaHasta: f.horaHasta }));
    if (dto.usaHorario !== undefined) {
      const d = await this.disponibilidadDe(ctx.usuarioId, ahora);
      await this.dataSource.getRepository(DisponibilidadPersonal).update({ id: d.id }, { usaHorario: dto.usaHorario, actualizadoEn: ahora, version: d.version + 1 });
    }
    await this.auditar('GUARDAR_HORARIOS', ctx.usuarioId, { franjas: antes.length }, { franjas: dto.franjas.length, usaHorario: dto.usaHorario }, ctx);
    return this.miDisponibilidad(ctx.usuarioId, ahora);
  }

  async agregarExcepcion(dto: CrearExcepcionDto, ctx: ContextoDespacho, ahora = new Date()) {
    if (dto.fechaHasta < dto.fechaDesde) throw new BadRequestException('La fecha final no puede ser anterior a la inicial.');
    if ((dto.horaDesde && !dto.horaHasta) || (!dto.horaDesde && dto.horaHasta)) throw new BadRequestException('Indique ambas horas o ninguna.');
    const repo = this.dataSource.getRepository(DisponibilidadExcepcion);
    const e = await repo.save(
      repo.create({ usuarioId: ctx.usuarioId, fechaDesde: dto.fechaDesde, fechaHasta: dto.fechaHasta, disponible: dto.disponible, horaDesde: dto.horaDesde ?? null, horaHasta: dto.horaHasta ?? null, motivo: dto.motivo ?? null }),
    );
    await this.auditar('AGREGAR_EXCEPCION_DISPONIBILIDAD', e.id, null, dto, ctx);
    return this.miDisponibilidad(ctx.usuarioId, ahora);
  }

  async quitarExcepcion(id: string, ctx: ContextoDespacho, ahora = new Date()) {
    const repo = this.dataSource.getRepository(DisponibilidadExcepcion);
    const r = await repo.delete({ id, usuarioId: ctx.usuarioId });
    if (!r.affected) throw new NotFoundException('La excepción no existe.');
    await this.auditar('QUITAR_EXCEPCION_DISPONIBILIDAD', id, null, null, ctx);
    return this.miDisponibilidad(ctx.usuarioId, ahora);
  }

  /** Latido del dispositivo: lo que permite saber si una persona esta en linea. */
  async latido(usuarioId: string, ahora = new Date()) {
    this.tiempoReal.latido(usuarioId, ahora);
    const d = await this.disponibilidadDe(usuarioId, ahora);
    await this.dataSource.getRepository(DisponibilidadPersonal).update({ id: d.id }, { ultimaActividad: ahora });
    return { ok: true, hora: ahora };
  }

  // ------------------------------------------------------------ solicitudes

  async crearSolicitud(dto: CrearSolicitudDto, ctx: ContextoDespacho, ahora = new Date()) {
    const solicitudes = this.dataSource.getRepository(SolicitudDespacho);
    if (dto.claveIdempotencia) {
      const previa = await solicitudes.findOne({ where: { claveIdempotencia: dto.claveIdempotencia } });
      if (previa) return { ...(await this.detalle(previa.id)), duplicada: true };
    }

    let moviles: Vehiculo[] = [];
    if (dto.tipo === 'CHOFER') {
      if (!dto.moviles?.length) throw new BadRequestException('Elegí al menos un móvil para solicitar chofer.');
      const ids = [...new Set(dto.moviles)];
      moviles = await this.dataSource.getRepository(Vehiculo).find({ where: { id: In(ids) } });
      if (moviles.length !== ids.length) throw new BadRequestException('Alguno de los móviles elegidos no existe.');
      if (moviles.some((m) => (m as { estado?: string }).estado === 'BAJA')) throw new BadRequestException('Alguno de los móviles elegidos está dado de baja.');
    }

    if (dto.servicioId) {
      const serv = await this.dataSource.getRepository(Servicio).findOne({ where: { id: dto.servicioId } });
      if (!serv) throw new BadRequestException('El servicio indicado no existe.');
    }

    const ocurrido = instanteDelHecho(dto.ocurridoEn, ahora);
    const solicitud = await solicitudes.save(
      solicitudes.create({
        tipo: dto.tipo,
        servicioId: dto.servicioId ?? null,
        llamadoId: dto.llamadoId ?? null,
        mensaje: dto.mensaje ?? null,
        estado: 'ABIERTA',
        requeridos: dto.requeridos ?? null,
        creadaPor: ctx.usuarioId,
        creadaPorNombre: ctx.username,
        cerradaEn: null,
        cerradaPor: null,
        motivoCierre: null,
        claveIdempotencia: dto.claveIdempotencia ?? null,
      }),
    );
    for (const m of moviles) await this.dataSource.getRepository(SolicitudMovil).save(this.dataSource.getRepository(SolicitudMovil).create({ solicitudId: solicitud.id, vehiculoId: m.id }));
    const autorizacionesChofer = dto.tipo === 'CHOFER'
      ? await this.dataSource.getRepository(VehiculoAutorizado).find({ where: { vehiculoId: In(moviles.map((m) => m.id)) } })
      : [];

    const actor = { id: ctx.usuarioId, nombre: ctx.username };
    const etiquetas = moviles.map(etiquetaMovil);
    await this.evento(solicitud.id, 'SOLICITUD_CREADA', actor, null, { tipo: dto.tipo, moviles: etiquetas, texto: textoSolicitud(dto.tipo, etiquetas, dto.mensaje ?? null) }, ocurrido, ahora);

    // ---- a quien se le puede enviar, y por que a los demas no
    const usuarios = (await this.dataSource.getRepository(Usuario).find({ where: { estado: 'ACTIVO' } })).filter((u) => u.id !== ctx.usuarioId);
    const audiencia: Usuario[] = [];
    for (const u of usuarios) {
      if ((await this.policy.getPermisosEfectivos(u.id)).includes('despacho:responder')) audiencia.push(u);
    }
    const ids = audiencia.map((u) => u.id);
    const [disps, horarios, excepciones] = ids.length
      ? await Promise.all([
          this.dataSource.getRepository(DisponibilidadPersonal).find({ where: { usuarioId: In(ids) } }),
          this.dataSource.getRepository(DisponibilidadHorario).find({ where: { usuarioId: In(ids) } }),
          this.dataSource.getRepository(DisponibilidadExcepcion).find({ where: { usuarioId: In(ids) } }),
        ])
      : [[], [], []];

    const destinatarios = this.dataSource.getRepository(SolicitudDestinatario);
    const enviadas: string[] = [];
    const resumen = { ENVIADA: 0, SIN_CONEXION: 0, NO_DISPONIBLE: 0, FUERA_DE_HORARIO: 0, EN_SERVICIO: 0, NO_HABILITADO_CHOFER: 0 };
    for (const u of audiencia) {
      const movilesHabilitados = dto.tipo === 'CHOFER' && u.bomberoId
        ? moviles.filter((m) => autorizacionesChofer.some((a) => a.bomberoId === u.bomberoId && a.vehiculoId === m.id)).map(etiquetaMovil)
        : [];
      const d = disps.find((x) => x.usuarioId === u.id);
      const estado: EstadoPersonal = d ? d.estado : 'NO_DISPONIBLE';
      const enHorario = disponiblePorHorario(
        d?.usaHorario ?? false,
        horarios.filter((h) => h.usuarioId === u.id),
        excepciones.filter((e) => e.usuarioId === u.id),
        ahora,
      );
      const enLinea = estaEnLinea(this.tiempoReal.conexionesAbiertas(u.id), this.tiempoReal.ultimaActividad(u.id) ?? d?.ultimaActividad ?? null, ahora);
      const habilitadoParaMoviles = dto.tipo !== 'CHOFER' || movilesHabilitados.length > 0;
      const entrega = habilitadoParaMoviles
        ? evaluarEntrega({ estado: estadoEfectivo(estado, d?.temporalHasta ?? null, ahora), temporalHasta: d?.temporalHasta ?? null, enHorario, enLinea }, ahora)
        : 'NO_HABILITADO_CHOFER';
      resumen[entrega]++;
      const dest = await destinatarios.save(
        destinatarios.create({
          solicitudId: solicitud.id,
          usuarioId: u.id,
          usuarioNombre: u.username,
          entrega,
          enviadaEn: ahora,
          recibidaEn: null,
          vistoTardeEn: null,
          estado: 'PENDIENTE',
          respondidoEn: null,
          aceptadaEn: null,
          enCaminoEn: null,
          llegoEn: null,
          canceladaEn: null,
          motivo: null,
          ampliacion: false,
          version: 0,
        }),
      );
      await this.evento(solicitud.id, 'ENTREGA', actor, u.id, {
        entrega,
        usuario: u.username,
        ...(dto.tipo === 'CHOFER' ? { movilesHabilitados } : {}),
        ...(entrega === 'NO_HABILITADO_CHOFER' ? { motivo: 'Sin autorización registrada para los móviles solicitados.' } : {}),
      }, ahora, ahora);
      if (entrega === 'ENVIADA') enviadas.push(dest.usuarioId);
    }
    await this.evento(solicitud.id, 'SOLICITUD_ENVIADA', actor, null, { destinatarios: audiencia.length, ...resumen }, ahora, ahora);

    this.tiempoReal.emitir({
      tipo: 'solicitud_nueva',
      solicitudId: solicitud.id,
      para: enviadas,
      seguimiento: true,
      datos: { tipo: dto.tipo, texto: textoSolicitud(dto.tipo, etiquetas, dto.mensaje ?? null), creadaPorNombre: ctx.username },
    });
    await this.auditar('CREAR_SOLICITUD', solicitud.id, null, { tipo: dto.tipo, moviles: etiquetas, ...resumen }, ctx);
    return { ...(await this.detalle(solicitud.id)), duplicada: false };
  }

  /** El dispositivo confirma que le llego la alerta. Una confirmacion a destiempo NO se hace pasar por recepcion a tiempo. */
  async confirmarRecepcion(solicitudId: string, usuarioId: string, ahora = new Date()) {
    const sol = await this.solicitudAbierta(solicitudId, false);
    const dest = await this.destinatarioDe(solicitudId, usuarioId);
    if (dest.entrega === 'ENVIADA') {
      if (dest.recibidaEn) return { ok: true, yaRegistrada: true };
      const resultado = await this.dataSource.getRepository(SolicitudDestinatario).update(
        { id: dest.id, recibidaEn: IsNull() },
        { recibidaEn: ahora },
      );
      if (!resultado.affected) return { ok: true, yaRegistrada: true };
      await this.evento(sol.id, 'RECIBIDA', { id: usuarioId, nombre: dest.usuarioNombre }, usuarioId, null, ahora, ahora);
    } else if (dest.entrega === 'SIN_CONEXION') {
      if (dest.vistoTardeEn) return { ok: true, yaRegistrada: true };
      if (sol.estado !== 'ABIERTA') throw new ConflictException('La solicitud ya está cerrada.');
      await this.dataSource.getRepository(SolicitudDestinatario).update({ id: dest.id }, { vistoTardeEn: ahora });
      await this.evento(sol.id, 'VISTA_TARDIA', { id: usuarioId, nombre: dest.usuarioNombre }, usuarioId, { enviadaEn: dest.enviadaEn }, ahora, ahora);
    } else if (!dest.ampliacion) {
      throw new ForbiddenException('No recibiste esta solicitud.');
    }
    this.tiempoReal.emitir({ tipo: 'solicitud_actualizada', solicitudId, para: [], seguimiento: true });
    return { ok: true, yaRegistrada: false };
  }

  async responder(solicitudId: string, dto: ResponderDto, ctx: ContextoDespacho, ahora = new Date()) {
    const resultado = await this.dataSource.transaction(async (manager) => {
      const sol = await manager.getRepository(SolicitudDespacho).findOne({
        where: { id: solicitudId }, lock: { mode: 'pessimistic_write' },
      });
      if (!sol) throw new NotFoundException('La solicitud no existe.');
      if (sol.estado !== 'ABIERTA') throw new ConflictException('La solicitud ya esta cerrada.');

      const dest = await manager.getRepository(SolicitudDestinatario).findOne({
        where: { solicitudId, usuarioId: ctx.usuarioId }, lock: { mode: 'pessimistic_write' },
      });
      if (!dest) throw new ForbiddenException('No formas parte de esta solicitud.');
      if (dest.entrega !== 'ENVIADA' && dest.entrega !== 'SIN_CONEXION' && !dest.ampliacion) {
        throw new ForbiddenException('No recibiste esta solicitud: no podes responderla.');
      }

      const nuevo = siguienteEstado(dest.estado, dto.accion);
      const motivo = exigirMotivo(dto.accion, dto.motivo);
      const cuando = instanteDelHecho(dto.ocurridoEn, ahora);
      const pers = await this.disponibilidadDe(ctx.usuarioId, ahora, manager);
      if (dto.accion === 'EN_CAMINO' && (pers.estado === 'EN_CAMINO' || pers.estado === 'EN_SERVICIO') && pers.solicitudId !== solicitudId) {
        throw new ConflictException('Ya estas en camino o en servicio por otra solicitud.');
      }

      const cambios: Partial<SolicitudDestinatario> = { estado: nuevo, respondidoEn: cuando, motivo: motivo ?? dest.motivo, version: dest.version + 1 };
      if (nuevo === 'ACEPTO' && !dest.aceptadaEn) cambios.aceptadaEn = cuando;
      if (nuevo === 'EN_CAMINO') cambios.enCaminoEn = cuando;
      if (nuevo === 'LLEGO') cambios.llegoEn = cuando;
      if (nuevo === 'CANCELO') cambios.canceladaEn = cuando;
      if (dto.accion === 'ACEPTAR') cambios.motivo = null;

      const actualizado = await manager.getRepository(SolicitudDestinatario).update(
        { id: dest.id, version: dest.version }, cambios,
      );
      if (!actualizado.affected) throw new ConflictException('Tu respuesta cambio desde otro dispositivo. Actualiza e intenta de nuevo.');

      const nuevoPersonal = estadoPersonalTras(dto.accion, pers.estado);
      if (nuevoPersonal) {
        const cambioPersonal = await manager.getRepository(DisponibilidadPersonal).update(
          { id: pers.id, version: pers.version },
          { estado: nuevoPersonal, desde: ahora, solicitudId: nuevoPersonal === 'EN_CAMINO' || nuevoPersonal === 'EN_SERVICIO' ? solicitudId : null, temporalHasta: null, version: pers.version + 1, actualizadoEn: ahora },
        );
        if (!cambioPersonal.affected) throw new ConflictException('Tu disponibilidad cambio desde otro dispositivo. Actualiza e intenta de nuevo.');
      }

      const tipoEvento = { PENDIENTE: 'PENDIENTE', ACEPTO: 'ACEPTO', NO_PUEDE: 'NO_PUEDE', CANCELO: 'CANCELO', EN_CAMINO: 'EN_CAMINO', LLEGO: 'LLEGO' }[nuevo];
      await this.evento(sol.id, tipoEvento, { id: ctx.usuarioId, nombre: ctx.username }, ctx.usuarioId, { desde: dest.estado, motivo, tardia: dest.entrega === 'SIN_CONEXION' || undefined }, cuando, ahora, manager);
      const sincronizaParticipante = nuevo === 'EN_CAMINO' || nuevo === 'LLEGO' || nuevo === 'CANCELO';
      if (sincronizaParticipante) await this.sincronizarParticipante(manager, sol.servicioId, ctx, nuevo, solicitudId, cuando);
      await this.auditar(`RESPONDER_${dto.accion}`, sol.id, { estado: dest.estado }, { estado: nuevo, motivo }, ctx, manager);
      return {
        creadaPor: sol.creadaPor,
        servicioId: sincronizaParticipante ? sol.servicioId : null,
        estado: nuevo,
        aceptadaEn: cambios.aceptadaEn ?? dest.aceptadaEn,
      };
    });

    this.tiempoReal.emitir({ tipo: 'solicitud_actualizada', solicitudId, para: [resultado.creadaPor], seguimiento: true, datos: { usuario: ctx.username, estado: resultado.estado } });
    if (resultado.servicioId) {
      this.tiempoReal.emitir({ tipo: 'servicio_actualizado', para: [], seguimiento: true, datos: { servicioId: resultado.servicioId, usuario: ctx.username, estado: resultado.estado } });
    }
    return { estado: resultado.estado, aceptadaEn: resultado.aceptadaEn };
  }

  /**
   * Quien avanza en una solicitud vinculada a un servicio pasa a figurar entre los participantes
   * de ese servicio: en camino al salir, en el sitio al llegar, retirado si cancela.
   */
  private async sincronizarParticipante(manager: EntityManager, servicioId: string | null, ctx: ContextoDespacho, estado: 'EN_CAMINO' | 'LLEGO' | 'CANCELO', solicitudId: string, ahora: Date) {
    if (!servicioId) return;
    const repo = manager.getRepository(ServicioParticipante);
    const previo = await repo.findOne({ where: { servicioId, usuarioId: ctx.usuarioId } });
    if (estado === 'CANCELO') {
      if (previo && previo.estado !== 'RETIRADO') await repo.update({ id: previo.id }, { estado: 'RETIRADO', hasta: ahora, version: previo.version + 1 });
    } else if (estado === 'EN_CAMINO') {
      if (!previo) await repo.save(repo.create({ servicioId, usuarioId: ctx.usuarioId, usuarioNombre: ctx.username, rol: null, estado: 'EN_CAMINO', solicitudId, desde: ahora, llegadaEn: null, hasta: null, version: 0 }));
      else await repo.update({ id: previo.id }, { estado: 'EN_CAMINO', solicitudId, hasta: null, version: previo.version + 1 });
    } else if (!previo) {
      await repo.save(repo.create({ servicioId, usuarioId: ctx.usuarioId, usuarioNombre: ctx.username, rol: null, estado: 'EN_SITIO', solicitudId, desde: ahora, llegadaEn: ahora, hasta: null, version: 0 }));
    } else {
      await repo.update({ id: previo.id }, { estado: 'EN_SITIO', llegadaEn: previo.llegadaEn ?? ahora, hasta: null, version: previo.version + 1 });
    }
  }

  /** "Buscar personal adicional": avisa a quienes estan en NO_DISPONIBLE (o fuera de horario) y siguen en linea. */
  async ampliar(solicitudId: string, ctx: ContextoDespacho, ahora = new Date()) {
    const resultado = await this.dataSource.transaction(async (manager) => {
      const sol = await manager.getRepository(SolicitudDespacho).findOne({
        where: { id: solicitudId }, lock: { mode: 'pessimistic_write' },
      });
      if (!sol) throw new NotFoundException('La solicitud no existe.');
      if (sol.estado !== 'ABIERTA') throw new ConflictException('La solicitud ya esta cerrada.');

      const dests = await manager.getRepository(SolicitudDestinatario).find({
        where: { solicitudId }, lock: { mode: 'pessimistic_write' },
      });
      const avisados: string[] = [];
      for (const dest of dests) {
        if (dest.estado !== 'PENDIENTE' || dest.ampliacion) continue;
        if (dest.entrega !== 'NO_DISPONIBLE' && dest.entrega !== 'FUERA_DE_HORARIO') continue;
        const pers = await manager.getRepository(DisponibilidadPersonal).findOne({ where: { usuarioId: dest.usuarioId } });
        if (!estaEnLinea(this.tiempoReal.conexionesAbiertas(dest.usuarioId), this.tiempoReal.ultimaActividad(dest.usuarioId) ?? pers?.ultimaActividad ?? null, ahora)) continue;
        avisados.push(dest.usuarioId);
        await this.evento(sol.id, 'AMPLIACION_ENVIADA', { id: ctx.usuarioId, nombre: ctx.username }, dest.usuarioId, null, ahora, ahora, manager);
      }
      await this.auditar('AMPLIAR_SOLICITUD', sol.id, null, { avisados: avisados.length }, ctx, manager);
      return { avisados };
    });

    this.tiempoReal.emitir({
      tipo: 'ampliacion',
      solicitudId,
      para: resultado.avisados,
      seguimiento: true,
      datos: { texto: 'Se necesita mas personal. Podes pasar a "Al llamado" por un rato?', horas: horasTemporal() },
    });
    return { avisados: resultado.avisados.length };
  }

  /** La persona acepta sumarse a una ampliacion: queda AL_LLAMADO de forma TEMPORAL, sin tocar su configuracion. */
  async unirmeAmpliacion(solicitudId: string, ctx: ContextoDespacho, ahora = new Date()) {
    const resultado = await this.dataSource.transaction(async (manager) => {
      const sol = await manager.getRepository(SolicitudDespacho).findOne({
        where: { id: solicitudId }, lock: { mode: 'pessimistic_write' },
      });
      if (!sol) throw new NotFoundException('La solicitud no existe.');
      if (sol.estado !== 'ABIERTA') throw new ConflictException('La solicitud ya esta cerrada.');

      const dest = await manager.getRepository(SolicitudDestinatario).findOne({
        where: { solicitudId, usuarioId: ctx.usuarioId }, lock: { mode: 'pessimistic_write' },
      });
      if (!dest) throw new ForbiddenException('No formas parte de esta solicitud.');
      if (dest.ampliacion) return { yaUnido: true as const, creadorId: sol.creadaPor, temporalHasta: null };
      if (dest.estado !== 'PENDIENTE' || (dest.entrega !== 'NO_DISPONIBLE' && dest.entrega !== 'FUERA_DE_HORARIO')) {
        throw new ConflictException('Esta solicitud no necesita que te sumes.');
      }

      const invitacion = await manager.getRepository(SolicitudEvento).findOne({
        where: { solicitudId, destinatarioId: ctx.usuarioId, tipo: 'AMPLIACION_ENVIADA' },
      });
      if (!invitacion) throw new ForbiddenException('No recibiste una invitacion para sumarte.');

      const pers = await this.disponibilidadDe(ctx.usuarioId, ahora, manager);
      const estadoActual = estadoEfectivo(pers.estado, pers.temporalHasta, ahora);
      if (estadoActual === 'EN_CAMINO' || estadoActual === 'EN_SERVICIO') {
        throw new ConflictException('Ya estas en camino o en servicio. Actualiza tu disponibilidad antes de responder.');
      }
      const hasta = new Date(ahora.getTime() + horasTemporal() * 3_600_000);
      const cambioDisponibilidad = await manager.getRepository(DisponibilidadPersonal).update(
        { id: pers.id, version: pers.version },
        { estado: 'AL_LLAMADO', desde: ahora, temporalHasta: hasta, solicitudId: null, version: pers.version + 1, actualizadoEn: ahora },
      );
      if (!cambioDisponibilidad.affected) throw new ConflictException('Tu disponibilidad cambio desde otro dispositivo. Actualiza e intenta de nuevo.');

      const cambioDestinatario = await manager.getRepository(SolicitudDestinatario).update(
        { id: dest.id, version: dest.version, ampliacion: false },
        { ampliacion: true, recibidaEn: ahora, version: dest.version + 1 },
      );
      if (!cambioDestinatario.affected) throw new ConflictException('Tu respuesta cambio desde otro dispositivo. Actualiza e intenta de nuevo.');

      await this.evento(sol.id, 'UNIDO_AMPLIACION', { id: ctx.usuarioId, nombre: ctx.username }, ctx.usuarioId, { temporalHasta: hasta }, ahora, ahora, manager);
      await this.auditar('UNIRSE_AMPLIACION', sol.id, { estado: estadoActual }, { estado: 'AL_LLAMADO', temporalHasta: hasta }, ctx, manager);
      return { yaUnido: false as const, creadorId: sol.creadaPor, temporalHasta: hasta };
    });

    if (resultado.yaUnido) return { ok: true, yaUnido: true };
    this.tiempoReal.emitir({ tipo: 'solicitud_actualizada', solicitudId, para: [resultado.creadorId], seguimiento: true, datos: { usuario: ctx.username, estado: 'UNIDO' } });
    return { ok: true, yaUnido: false, temporalHasta: resultado.temporalHasta };
  }

  async cerrar(solicitudId: string, dto: CerrarSolicitudDto, ctx: ContextoDespacho, ahora = new Date()) {
    const resultado = await this.dataSource.transaction(async (manager) => {
      const repoSolicitud = manager.getRepository(SolicitudDespacho);
      const sol = await repoSolicitud.findOne({
        where: { id: solicitudId }, lock: { mode: 'pessimistic_write' },
      });
      if (!sol) throw new NotFoundException('La solicitud no existe.');
      if (sol.estado !== 'ABIERTA') throw new ConflictException('La solicitud ya esta cerrada.');

      const cerrada = await repoSolicitud.update(
        { id: solicitudId, estado: 'ABIERTA' },
        { estado: dto.estado, cerradaEn: ahora, cerradaPor: ctx.usuarioId, motivoCierre: dto.motivo ?? null },
      );
      if (!cerrada.affected) throw new ConflictException('La solicitud ya fue cerrada por otra persona.');

      const destinatarios = await manager.getRepository(SolicitudDestinatario).find({
        where: { solicitudId }, lock: { mode: 'pessimistic_write' },
      });
      if (dto.estado === 'CANCELADA') {
        for (const dest of destinatarios.filter((fila) => fila.estado === 'EN_CAMINO')) {
          const pers = await this.disponibilidadDe(dest.usuarioId, ahora, manager);
          if (pers.solicitudId !== solicitudId) continue;

          const liberada = await manager.getRepository(DisponibilidadPersonal).update(
            { id: pers.id, version: pers.version },
            { estado: 'AL_LLAMADO', solicitudId: null, desde: ahora, version: pers.version + 1, actualizadoEn: ahora },
          );
          if (!liberada.affected) throw new ConflictException('La disponibilidad de un integrante cambio. Actualiza el seguimiento e intenta de nuevo.');

          const participantes = manager.getRepository(ServicioParticipante);
          const participante = sol.servicioId
            ? await participantes.findOne({
                where: { servicioId: sol.servicioId, usuarioId: dest.usuarioId, hasta: IsNull() },
                lock: { mode: 'pessimistic_write' },
              })
            : null;
          let participanteRetirado = false;
          if (participante && participante.estado !== 'RETIRADO') {
            const retiro = await participantes.update(
              { id: participante.id, version: participante.version },
              { estado: 'RETIRADO', hasta: ahora, version: participante.version + 1 },
            );
            if (!retiro.affected) throw new ConflictException('La participacion de un integrante cambio. Actualiza el seguimiento e intenta de nuevo.');
            participanteRetirado = true;
          }
          await this.evento(sol.id, 'LIBERADO_POR_CANCELACION', { id: ctx.usuarioId, nombre: ctx.username }, dest.usuarioId, { afectado: dest.usuarioNombre, disponibilidad: 'AL_LLAMADO', participanteRetirado }, ahora, ahora, manager);
        }
      }

      await this.evento(sol.id, dto.estado === 'CERRADA' ? 'SOLICITUD_CERRADA' : 'SOLICITUD_CANCELADA', { id: ctx.usuarioId, nombre: ctx.username }, null, { motivo: dto.motivo ?? null }, ahora, ahora, manager);
      await this.auditar(dto.estado === 'CERRADA' ? 'CERRAR_SOLICITUD' : 'CANCELAR_SOLICITUD', sol.id, { estado: 'ABIERTA' }, { estado: dto.estado, motivo: dto.motivo ?? null }, ctx, manager);
      return { destinatarios: destinatarios.map((dest) => dest.usuarioId), estado: dto.estado };
    });

    this.tiempoReal.emitir({ tipo: 'solicitud_cerrada', solicitudId, para: resultado.destinatarios, seguimiento: true, datos: { estado: resultado.estado } });
    return this.detalle(solicitudId);
  }

  // ------------------------------------------------------------ consultas

  private async solicitudAbierta(id: string, exigirAbierta: boolean): Promise<SolicitudDespacho> {
    const sol = await this.dataSource.getRepository(SolicitudDespacho).findOne({ where: { id } });
    if (!sol) throw new NotFoundException('La solicitud no existe.');
    if (exigirAbierta && sol.estado !== 'ABIERTA') throw new ConflictException('La solicitud ya está cerrada.');
    return sol;
  }

  private async destinatarioDe(solicitudId: string, usuarioId: string): Promise<SolicitudDestinatario> {
    const d = await this.dataSource.getRepository(SolicitudDestinatario).findOne({ where: { solicitudId, usuarioId } });
    if (!d) throw new ForbiddenException('No formás parte de esta solicitud.');
    return d;
  }

  private async etiquetasMoviles(solicitudId: string): Promise<string[]> {
    const filas = await this.dataSource.getRepository(SolicitudMovil).find({ where: { solicitudId } });
    if (!filas.length) return [];
    const vehiculos = await this.dataSource.getRepository(Vehiculo).find({ where: { id: In(filas.map((f) => f.vehiculoId)) } });
    return vehiculos.map(etiquetaMovil);
  }

  /** Lo que ve quien coordina: la solicitud y los grupos de respuesta. */
  async detalle(id: string) {
    const sol = await this.solicitudAbierta(id, false);
    const moviles = await this.etiquetasMoviles(id);
    const dests = await this.dataSource.getRepository(SolicitudDestinatario).find({ where: { solicitudId: id } });
    const grupos = agruparSeguimiento(dests);
    return {
      id: sol.id,
      tipo: sol.tipo,
      estado: sol.estado,
      texto: textoSolicitud(sol.tipo, moviles, sol.mensaje),
      moviles,
      requeridos: sol.requeridos,
      creadaPor: sol.creadaPorNombre,
      creadoEn: sol.creadoEn,
      cerradaEn: sol.cerradaEn,
      motivoCierre: sol.motivoCierre,
      servicioId: sol.servicioId,
      llamadoId: sol.llamadoId,
      totales: {
        destinatarios: dests.length,
        aceptaron: grupos.aceptaron.length + grupos.enCamino.length + grupos.llegaron.length,
        enCamino: grupos.enCamino.length,
        llegaron: grupos.llegaron.length,
        sinResponder: grupos.sinResponder.length + grupos.enviadasSinConfirmar.length,
        noPueden: grupos.noPueden.length,
        cancelaron: grupos.cancelaron.length,
        noRecibieron: Object.values(grupos.noRecibieron).reduce((n, l) => n + l.length, 0),
      },
      grupos,
    };
  }

  async linea(id: string) {
    await this.solicitudAbierta(id, false);
    const eventos = await this.dataSource.getRepository(SolicitudEvento).find({ where: { solicitudId: id }, order: { ocurridoEn: 'ASC' } });
    return eventos.map((e) => ({
      id: e.id,
      tipo: e.tipo,
      actor: e.actorNombre,
      destinatarioId: e.destinatarioId,
      detalle: e.detalle ? JSON.parse(e.detalle) : null,
      ocurridoEn: e.ocurridoEn,
      registradoEn: e.registradoEn,
    }));
  }

  async listar(soloAbiertas: boolean) {
    const filas = await this.dataSource.getRepository(SolicitudDespacho).find({ where: soloAbiertas ? { estado: 'ABIERTA' } : {}, order: { creadoEn: 'DESC' }, take: 50 });
    const salida: Array<Record<string, unknown>> = [];
    for (const f of filas) salida.push(await this.detalle(f.id).then(({ grupos: _g, ...resto }) => resto));
    return salida;
  }

  /** Lo que ve la persona que recibe: sus solicitudes abiertas y su propio estado en cada una. */
  async misSolicitudes(usuarioId: string) {
    const mias = await this.dataSource.getRepository(SolicitudDestinatario).find({ where: { usuarioId } });
    const visibles = mias.filter((d) => d.entrega === 'ENVIADA' || d.entrega === 'SIN_CONEXION' || d.ampliacion);
    if (!visibles.length) return [];
    const sols = await this.dataSource.getRepository(SolicitudDespacho).find({ where: { id: In(visibles.map((d) => d.solicitudId)), estado: 'ABIERTA' }, order: { creadoEn: 'DESC' } });
    const salida: Array<Record<string, unknown>> = [];
    for (const s of sols) {
      const d = visibles.find((x) => x.solicitudId === s.id)!;
      const moviles = await this.etiquetasMoviles(s.id);
      const entregaEvento = s.tipo === 'CHOFER'
        ? await this.dataSource.getRepository(SolicitudEvento).findOne({ where: { solicitudId: s.id, destinatarioId: usuarioId, tipo: 'ENTREGA' } })
        : null;
      let misMovilesHabilitados: string[] = [];
      if (entregaEvento?.detalle) {
        try {
          const detalle = JSON.parse(entregaEvento.detalle) as { movilesHabilitados?: unknown };
          if (Array.isArray(detalle.movilesHabilitados)) misMovilesHabilitados = detalle.movilesHabilitados.filter((m): m is string => typeof m === 'string');
        } catch { /* Un evento legado mal formado no impide responder. */ }
      }
      salida.push({
        solicitudId: s.id,
        tipo: s.tipo,
        texto: textoSolicitud(s.tipo, moviles, s.mensaje),
        ...(s.tipo === 'CHOFER' ? { misMovilesHabilitados } : {}),
        creadaPor: s.creadaPorNombre,
        creadoEn: s.creadoEn,
        miEstado: d.estado,
        entrega: d.entrega,
        tardia: d.entrega === 'SIN_CONEXION',
        recibidaEn: d.recibidaEn,
        vistoTardeEn: d.vistoTardeEn,
        aceptadaEn: d.aceptadaEn,
        enCaminoEn: d.enCaminoEn,
        motivo: d.motivo,
      });
    }
    return salida;
  }
}
