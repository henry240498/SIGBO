import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface EventoDespacho {
  tipo: 'solicitud_nueva' | 'solicitud_actualizada' | 'solicitud_cerrada' | 'ampliacion' | 'disponibilidad' | 'servicio_actualizado' | 'mensaje' | 'formulario';
  solicitudId?: string;
  servicioId?: string;
  /** Datos minimos para mostrar el aviso. Nada confidencial viaja por el stream. */
  datos?: Record<string, unknown>;
  /** Usuarios que reciben el evento. */
  para: string[];
  /** Ademas, quien puede ver el seguimiento completo (permiso despacho:seguimiento). */
  seguimiento?: boolean;
}

/**
 * Bus de eventos en memoria + presencia. Igual que el de alertas: sirve con UNA instancia
 * del backend; con varias habria que reemplazar este unico punto por un broker.
 *
 * Presencia: una persona esta "en linea" si tiene un stream abierto o mostro actividad
 * hace poco (ver estaEnLinea). Es lo que permite distinguir "no recibio porque estaba
 * desconectado" de "no recibio porque estaba en No disponible".
 */
@Injectable()
export class DespachoTiempoReal {
  private readonly bus$ = new Subject<EventoDespacho>();
  private readonly conexiones = new Map<string, number>();
  private readonly actividad = new Map<string, Date>();

  emitir(evento: EventoDespacho) {
    this.bus$.next(evento);
  }

  /** Flujo de eventos que le corresponden a una persona. */
  flujoPara(usuarioId: string, puedeVerSeguimiento: boolean): Observable<EventoDespacho> {
    return this.bus$.pipe(filter((e) => e.para.includes(usuarioId) || (!!e.seguimiento && puedeVerSeguimiento)));
  }

  conectar(usuarioId: string, ahora = new Date()) {
    this.conexiones.set(usuarioId, (this.conexiones.get(usuarioId) ?? 0) + 1);
    this.actividad.set(usuarioId, ahora);
  }

  desconectar(usuarioId: string, ahora = new Date()) {
    const n = (this.conexiones.get(usuarioId) ?? 1) - 1;
    if (n <= 0) this.conexiones.delete(usuarioId);
    else this.conexiones.set(usuarioId, n);
    this.actividad.set(usuarioId, ahora);
  }

  latido(usuarioId: string, ahora = new Date()) {
    this.actividad.set(usuarioId, ahora);
  }

  conexionesAbiertas(usuarioId: string): number {
    return this.conexiones.get(usuarioId) ?? 0;
  }

  ultimaActividad(usuarioId: string): Date | null {
    return this.actividad.get(usuarioId) ?? null;
  }
}
