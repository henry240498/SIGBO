import { BadRequestException, ConflictException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  Convocatoria,
  ConvocatoriaRespuesta,
  ConvocatoriaRespuestaEvento,
  EstadoLlamado,
  Llamado,
  Servicio,
  TipoServicio,
} from '../../shared/entities';
import { TelegramService } from '../notificaciones/telegram.service';
import { instanteDelHecho } from '../../shared/utils/instante';
import { AuditoriaService } from '../seguridad/auditoria.service';
import {
  CambiarEstadoLlamadoDto,
  CrearConvocatoriaDto,
  CrearLlamadoDto,
  ResponderConvocatoriaDto,
} from './dto/llamados.dto';

export interface ContextoLlamados {
  usuarioId: string;
  username: string;
  ip?: string | null;
  userAgent?: string | null;
}

/** Un llamado solo avanza: no se reabre (si vuelve a llamar, es un llamado nuevo). */
const TRANSICIONES: Record<EstadoLlamado, EstadoLlamado[]> = {
  RECIBIDO: ['EN_ATENCION', 'CERRADO'],
  EN_ATENCION: ['CERRADO'],
  CERRADO: [],
};

@Injectable()
export class LlamadosService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
    @Optional() private readonly telegram?: TelegramService,
  ) {}

  // ---------------- llamados (2.1) ----------------

  async crearLlamado(dto: CrearLlamadoDto, ctx: ContextoLlamados) {
    if (dto.tipoServicioId) {
      const tipo = await this.dataSource.getRepository(TipoServicio).findOne({ where: { id: dto.tipoServicioId } });
      if (!tipo) throw new BadRequestException('El tipo de servicio indicado no existe.');
    }
    const repo = this.dataSource.getRepository(Llamado);
    if (dto.claveIdempotencia) {
      const previo = await repo.findOne({ where: { claveIdempotencia: dto.claveIdempotencia } });
      if (previo) return previo; // reintento del mismo envio
    }
    const llamado = await repo.save(
      repo.create({
        recibidoEn: instanteDelHecho(dto.ocurridoEn),
        claveIdempotencia: dto.claveIdempotencia ?? null,
        medio: dto.medio,
        llamanteNombre: dto.llamanteNombre ?? null,
        llamanteTelefono: dto.llamanteTelefono ?? null,
        direccion: dto.direccion,
        referencia: dto.referencia ?? null,
        descripcion: dto.descripcion ?? null,
        tipoServicioId: dto.tipoServicioId ?? null,
        estado: 'RECIBIDO',
        servicioId: null,
        recibidoPor: ctx.usuarioId,
      }),
    );
    await this.auditar('CREAR', 'servicios.llamado', llamado.id, null, { medio: llamado.medio, direccion: llamado.direccion }, ctx);
    return llamado;
  }

  listarLlamados(filtros: { estado?: EstadoLlamado; limite?: number }) {
    return this.dataSource.getRepository(Llamado).find({
      where: filtros.estado ? { estado: filtros.estado } : {},
      order: { recibidoEn: 'DESC' },
      take: Math.min(Math.max(filtros.limite || 100, 1), 500),
    });
  }

  async obtenerLlamado(id: string) {
    const llamado = await this.dataSource.getRepository(Llamado).findOne({ where: { id } });
    if (!llamado) throw new NotFoundException('Llamado no encontrado');
    return llamado;
  }

  async cambiarEstadoLlamado(id: string, dto: CambiarEstadoLlamadoDto, ctx: ContextoLlamados) {
    const llamado = await this.obtenerLlamado(id);
    if (!TRANSICIONES[llamado.estado].includes(dto.estado)) {
      throw new ConflictException(`El llamado esta ${llamado.estado}; no puede pasar a ${dto.estado}.`);
    }
    // Cerrar un llamado que nunca se atendio exige dejar por que.
    if (dto.estado === 'CERRADO' && llamado.estado === 'RECIBIDO' && !dto.motivo) {
      throw new BadRequestException('Indique el motivo para cerrar un llamado que no llego a atenderse.');
    }
    const antes = llamado.estado;
    llamado.estado = dto.estado;
    if (dto.estado === 'CERRADO') {
      llamado.motivoCierre = dto.motivo ?? null;
      llamado.cerradoPor = ctx.usuarioId;
      llamado.cerradoEn = new Date();
    }
    const guardado = await this.dataSource.getRepository(Llamado).save(llamado);
    await this.auditar('CAMBIAR_ESTADO', 'servicios.llamado', id, { estado: antes }, { estado: guardado.estado, motivo: dto.motivo }, ctx);
    return guardado;
  }

  async vincularServicio(id: string, servicioId: string, ctx: ContextoLlamados) {
    const llamado = await this.obtenerLlamado(id);
    if (llamado.estado === 'CERRADO') throw new ConflictException('El llamado ya esta cerrado.');
    const servicio = await this.dataSource.getRepository(Servicio).findOne({ where: { id: servicioId } });
    if (!servicio) throw new NotFoundException('Servicio no encontrado');
    const antes = { estado: llamado.estado, servicioId: llamado.servicioId };
    llamado.servicioId = servicioId;
    if (llamado.estado === 'RECIBIDO') llamado.estado = 'EN_ATENCION';
    const guardado = await this.dataSource.getRepository(Llamado).save(llamado);
    await this.auditar('VINCULAR_SERVICIO', 'servicios.llamado', id, antes, { estado: guardado.estado, servicioId }, ctx);
    return guardado;
  }

  // ---------------- convocatorias (2.2) ----------------

  async crearConvocatoria(dto: CrearConvocatoriaDto, ctx: ContextoLlamados) {
    if (dto.llamadoId) await this.obtenerLlamado(dto.llamadoId);
    if (dto.servicioId) {
      const servicio = await this.dataSource.getRepository(Servicio).findOne({ where: { id: dto.servicioId } });
      if (!servicio) throw new NotFoundException('Servicio no encontrado');
    }
    const repo = this.dataSource.getRepository(Convocatoria);
    const convocatoria = await repo.save(
      repo.create({
        mensaje: dto.mensaje,
        llamadoId: dto.llamadoId ?? null,
        servicioId: dto.servicioId ?? null,
        estado: 'ABIERTA',
        creadaPor: ctx.usuarioId,
      }),
    );
    await this.auditar('CREAR', 'servicios.convocatoria', convocatoria.id, null, { mensaje: convocatoria.mensaje }, ctx);
    // Aviso opcional por Telegram: en segundo plano, sin afectar la convocatoria si falla.
    this.telegram?.enviarEnSegundoPlano(`CONVOCATORIA
${convocatoria.mensaje}
Respondé desde la app: VOY o NO PUEDO.`);
    return convocatoria;
  }

  /** Convocatorias abiertas con la respuesta del usuario que consulta (para la app). */
  async abiertasPara(usuarioId: string) {
    const abiertas = await this.dataSource.getRepository(Convocatoria).find({
      where: { estado: 'ABIERTA' },
      order: { creadoEn: 'DESC' },
      take: 20,
    });
    if (abiertas.length === 0) return [];
    const respuestas = await this.dataSource.getRepository(ConvocatoriaRespuesta).find({ where: { usuarioId } });
    const propias = new Map(respuestas.map((r) => [r.convocatoriaId, r]));
    return abiertas.map((c) => {
      const r = propias.get(c.id);
      return {
        id: c.id,
        mensaje: c.mensaje,
        creadoEn: c.creadoEn,
        miRespuesta: r ? {
          respuesta: r.respuesta,
          etaMinutos: r.etaMinutos,
          motivo: r.motivo,
          enCaminoEn: r.enCaminoEn,
          canceladaEn: r.canceladaEn,
        } : null,
      };
    });
  }

  listarConvocatorias(limite?: number) {
    return this.dataSource.getRepository(Convocatoria).find({
      order: { creadoEn: 'DESC' },
      take: Math.min(Math.max(limite || 50, 1), 200),
    });
  }

  /** Detalle con quien respondio que, y los totales. */
  async detalleConvocatoria(id: string) {
    const convocatoria = await this.obtenerConvocatoria(id);
    const respuestas = await this.dataSource.getRepository(ConvocatoriaRespuesta).find({
      where: { convocatoriaId: id },
      order: { respondidoEn: 'ASC' },
    });
    const eventos = await this.dataSource.getRepository(ConvocatoriaRespuestaEvento).find({
      where: { convocatoriaId: id },
      order: { ocurridoEn: 'ASC' },
    });
    return {
      ...convocatoria,
      respuestas,
      eventos,
      totales: {
        voy: respuestas.filter((r) => r.respuesta === 'VOY').length,
        noPuedo: respuestas.filter((r) => r.respuesta === 'NO_PUEDO').length,
      },
    };
  }

  async responder(id: string, dto: ResponderConvocatoriaDto, ctx: ContextoLlamados) {
    if (dto.respuesta === 'NO_PUEDO' && dto.etaMinutos !== undefined) {
      throw new BadRequestException('El tiempo de llegada solo corresponde a una respuesta VOY.');
    }
    const { guardada, accion, previa } = await this.dataSource.transaction(async (manager) => {
      const convocatoria = await manager.getRepository(Convocatoria).findOne({
        where: { id }, lock: { mode: 'pessimistic_write' },
      });
      if (!convocatoria) throw new NotFoundException('Convocatoria no encontrada');
      if (convocatoria.estado !== 'ABIERTA') throw new ConflictException('La convocatoria ya esta cerrada.');
      const repo = manager.getRepository(ConvocatoriaRespuesta);
      const eventoRepo = manager.getRepository(ConvocatoriaRespuestaEvento);
      const previa = await repo.findOne({ where: { convocatoriaId: id, usuarioId: ctx.usuarioId } });
      const ahora = new Date();
      const fila = previa ?? repo.create({ convocatoriaId: id, usuarioId: ctx.usuarioId, usuarioNombre: ctx.username });
      const respuestaAnterior = previa?.respuesta ?? null;
      fila.respuesta = dto.respuesta;
      fila.etaMinutos = dto.respuesta === 'VOY' ? dto.etaMinutos ?? null : null;
      fila.respondidoEn = ahora;
      fila.motivo = dto.respuesta === 'NO_PUEDO' ? dto.motivo ?? null : null;
      if (dto.respuesta === 'VOY') fila.canceladaEn = null;
      const guardada = await repo.save(fila);
      const accion = dto.respuesta === 'NO_PUEDO'
        ? 'RECHAZAR'
        : respuestaAnterior === 'NO_PUEDO' || previa?.canceladaEn
          ? 'CAMBIAR_RESPUESTA'
          : 'ACEPTAR';
      await eventoRepo.save(eventoRepo.create({
        convocatoriaId: id,
        usuarioId: ctx.usuarioId,
        usuarioNombre: ctx.username,
        accion,
        respuesta: dto.respuesta,
        motivo: dto.motivo ?? null,
        ocurridoEn: ahora,
      }));
      return { guardada, accion, previa };
    });
    await this.auditar(
      previa ? 'CAMBIAR_RESPUESTA' : 'RESPONDER',
      'servicios.convocatoria',
      id,
      previa ? { respuesta: previa.respuesta } : null,
      { respuesta: guardada.respuesta, etaMinutos: guardada.etaMinutos },
      ctx,
    );
    return { respuesta: guardada.respuesta, etaMinutos: guardada.etaMinutos };
  }

  async marcarEnCamino(id: string, ctx: ContextoLlamados) {
    const guardada = await this.dataSource.transaction(async (manager) => {
      const convocatoria = await manager.getRepository(Convocatoria).findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!convocatoria) throw new NotFoundException('Convocatoria no encontrada');
      if (convocatoria.estado !== 'ABIERTA') throw new ConflictException('La convocatoria ya esta cerrada.');
      const repo = manager.getRepository(ConvocatoriaRespuesta);
      const fila = await repo.findOne({ where: { convocatoriaId: id, usuarioId: ctx.usuarioId } });
      if (!fila || fila.respuesta !== 'VOY' || fila.canceladaEn) {
        throw new ConflictException('Para indicar que esta en camino primero debe aceptar la convocatoria.');
      }
      if (fila.enCaminoEn) throw new ConflictException('Ya se registro que esta en camino.');
      const ahora = new Date();
      fila.enCaminoEn = ahora;
      await repo.save(fila);
      await manager.getRepository(ConvocatoriaRespuestaEvento).save({
        convocatoriaId: id, usuarioId: ctx.usuarioId, usuarioNombre: ctx.username,
        accion: 'EN_CAMINO', respuesta: 'VOY', motivo: null, ocurridoEn: ahora,
      });
      return fila;
    });
    await this.auditar('EN_CAMINO', 'servicios.convocatoria', id, null, { usuarioId: ctx.usuarioId, enCaminoEn: guardada.enCaminoEn }, ctx);
    return { respuesta: guardada.respuesta, enCaminoEn: guardada.enCaminoEn };
  }

  async cancelarAsistencia(id: string, motivo: string | undefined, ctx: ContextoLlamados) {
    const guardada = await this.dataSource.transaction(async (manager) => {
      const convocatoria = await manager.getRepository(Convocatoria).findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!convocatoria) throw new NotFoundException('Convocatoria no encontrada');
      if (convocatoria.estado !== 'ABIERTA') throw new ConflictException('La convocatoria ya esta cerrada.');
      const repo = manager.getRepository(ConvocatoriaRespuesta);
      const fila = await repo.findOne({ where: { convocatoriaId: id, usuarioId: ctx.usuarioId } });
      if (!fila || fila.respuesta !== 'VOY' || fila.canceladaEn) {
        throw new ConflictException('No existe una asistencia aceptada para cancelar.');
      }
      const ahora = new Date();
      fila.canceladaEn = ahora;
      fila.motivo = motivo ?? null;
      await repo.save(fila);
      await manager.getRepository(ConvocatoriaRespuestaEvento).save({
        convocatoriaId: id, usuarioId: ctx.usuarioId, usuarioNombre: ctx.username,
        accion: 'CANCELAR_ASISTENCIA', respuesta: 'VOY', motivo: motivo ?? null, ocurridoEn: ahora,
      });
      return fila;
    });
    await this.auditar('CANCELAR_ASISTENCIA', 'servicios.convocatoria', id, null, { usuarioId: ctx.usuarioId, motivo: motivo ?? null }, ctx);
    return { respuesta: guardada.respuesta, canceladaEn: guardada.canceladaEn };
  }

  async cerrarConvocatoria(id: string, ctx: ContextoLlamados) {
    const convocatoria = await this.obtenerConvocatoria(id);
    if (convocatoria.estado === 'CERRADA') throw new ConflictException('La convocatoria ya esta cerrada.');
    convocatoria.estado = 'CERRADA';
    convocatoria.cerradaEn = new Date();
    convocatoria.cerradaPor = ctx.usuarioId;
    const guardada = await this.dataSource.getRepository(Convocatoria).save(convocatoria);
    await this.auditar('CERRAR', 'servicios.convocatoria', id, { estado: 'ABIERTA' }, { estado: 'CERRADA' }, ctx);
    return guardada;
  }

  // ---------------- internos ----------------

  private async obtenerConvocatoria(id: string) {
    const c = await this.dataSource.getRepository(Convocatoria).findOne({ where: { id } });
    if (!c) throw new NotFoundException('Convocatoria no encontrada');
    return c;
  }

  private auditar(
    accion: string,
    recurso: string,
    recursoId: string,
    antes: unknown,
    despues: unknown,
    ctx: ContextoLlamados,
  ) {
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
