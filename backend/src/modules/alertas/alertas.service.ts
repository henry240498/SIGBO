import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Subject } from 'rxjs';
import {
  AlertaEmergencia,
  EstadoAlertaEmergencia,
} from '../../shared/entities/alerta-emergencia.entity';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CambiarEstadoAlertaDto, CrearAlertaDto } from './dto/alertas.dto';

export interface ResultadoAlerta {
  alerta: AlertaEmergencia;
  /** true cuando la solicitud ya existia (reintento o doble pulsacion). */
  duplicada: boolean;
}

/** Ventana anti-rebote (segundos) parametrizable: ALERTAS_DEBOUNCE_SEGUNDOS. */
function ventanaAntirreboteSegundos(): number {
  const raw = Number(process.env.ALERTAS_DEBOUNCE_SEGUNDOS ?? 10);
  if (!Number.isFinite(raw) || raw < 0) return 10;
  return Math.min(Math.floor(raw), 300);
}

@Injectable()
export class AlertasService {
  /**
   * Bus de eventos en memoria para el stream SSE (tiempo real en red local
   * sin depender de Firebase ni de ningun servicio externo). Si a futuro se
   * despliega un broker (Redis/FCM), este es el unico punto a reemplazar.
   */
  private readonly eventos$ = new Subject<AlertaEmergencia>();

  constructor(
    @InjectRepository(AlertaEmergencia)
    private readonly alertaRepo: Repository<AlertaEmergencia>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  observarEventos(): Subject<AlertaEmergencia> {
    return this.eventos$;
  }

  async crear(
    dto: CrearAlertaDto,
    solicitante: { id: string; username: string },
    ctx: { ip?: string | null; userAgent?: string | null },
  ): Promise<ResultadoAlerta> {
    // 1) Idempotencia exacta: misma clave => misma alerta, sin duplicar.
    const existentePorClave = await this.alertaRepo.findOne({
      where: { claveIdempotencia: dto.claveIdempotencia },
    });
    if (existentePorClave) return { alerta: existentePorClave, duplicada: true };

    // 2) Anti-rebote: mismo bombero + mismo tipo con PENDIENTE reciente
    // (doble tap con claves distintas) => se devuelve la vigente.
    const ventana = ventanaAntirreboteSegundos();
    if (ventana > 0) {
      const desde = new Date(Date.now() - ventana * 1000);
      const reciente = await this.alertaRepo.findOne({
        where: {
          solicitanteId: solicitante.id,
          tipo: dto.tipo,
          estado: 'PENDIENTE' as EstadoAlertaEmergencia,
          creadoEn: MoreThan(desde),
        },
        order: { creadoEn: 'DESC' },
      });
      if (reciente) return { alerta: reciente, duplicada: true };
    }

    try {
      const alerta = await this.alertaRepo.save(
        this.alertaRepo.create({
          tipo: dto.tipo,
          estado: 'PENDIENTE',
          solicitanteId: solicitante.id,
          solicitanteNombre: solicitante.username,
          detalle: dto.detalle?.trim() ? dto.detalle.trim() : null,
          latitud: dto.latitud ?? null,
          longitud: dto.longitud ?? null,
          claveIdempotencia: dto.claveIdempotencia,
        }),
      );
      await this.auditoriaService.registrar({
        usuarioId: solicitante.id,
        accion: 'CREAR',
        recurso: 'servicios.alerta_emergencia',
        recursoId: alerta.id,
        datosDespues: { tipo: alerta.tipo, detalle: alerta.detalle },
        ip: ctx.ip ?? null,
        userAgent: ctx.userAgent ?? null,
      });
      this.eventos$.next(alerta);
      return { alerta, duplicada: false };
    } catch (error) {
      // Carrera entre dos pulsaciones simultaneas: la UNIQUE de
      // claveIdempotencia gana una; la otra recupera la original.
      const reintento = await this.alertaRepo.findOne({
        where: { claveIdempotencia: dto.claveIdempotencia },
      });
      if (reintento) return { alerta: reintento, duplicada: true };
      throw error;
    }
  }

  async listar(filtros: { estado?: EstadoAlertaEmergencia; solicitanteId?: string; limite?: number }) {
    const limite = Math.min(Math.max(filtros.limite ?? 50, 1), 200);
    return this.alertaRepo.find({
      where: {
        ...(filtros.estado ? { estado: filtros.estado } : {}),
        ...(filtros.solicitanteId ? { solicitanteId: filtros.solicitanteId } : {}),
      },
      order: { creadoEn: 'DESC' },
      take: limite,
    });
  }

  async obtener(id: string): Promise<AlertaEmergencia> {
    const alerta = await this.alertaRepo.findOne({ where: { id } });
    if (!alerta) throw new NotFoundException(`Alerta ${id} no encontrada`);
    return alerta;
  }

  async cambiarEstado(
    id: string,
    dto: CambiarEstadoAlertaDto,
    actor: { id: string; username: string },
    ctx: { ip?: string | null; userAgent?: string | null },
  ): Promise<AlertaEmergencia> {
    const alerta = await this.obtener(id);
    if (alerta.estado !== 'PENDIENTE') {
      throw new ConflictException(
        `La alerta ya esta ${alerta.estado}; solo una alerta PENDIENTE puede atenderse o cancelarse.`,
      );
    }
    const antes = alerta.estado;
    alerta.estado = dto.estado;
    alerta.atendidaPor = actor.id;
    alerta.atendidaPorNombre = actor.username;
    alerta.atendidaEn = new Date();
    alerta.motivoEstado = dto.motivo?.trim() ? dto.motivo.trim() : null;
    const guardada = await this.alertaRepo.save(alerta);
    await this.auditoriaService.registrar({
      usuarioId: actor.id,
      accion: dto.estado === 'ATENDIDA' ? 'ATENDER' : 'CANCELAR',
      recurso: 'servicios.alerta_emergencia',
      recursoId: guardada.id,
      datosAntes: { estado: antes },
      datosDespues: { estado: guardada.estado, motivo: guardada.motivoEstado },
      ip: ctx.ip ?? null,
      userAgent: ctx.userAgent ?? null,
    });
    this.eventos$.next(guardada);
    return guardada;
  }
}
