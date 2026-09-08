import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RATE_LIMIT_KEY, RateLimitOpciones } from '../decorators/rate-limit.decorator';

interface Ventana {
  /** Marcas de tiempo (ms) de las solicitudes dentro de la ventana vigente. */
  golpes: number[];
  /** Hasta cuando queda penalizado quien supero el limite. */
  bloqueadoHasta: number;
  /** Cada endpoint conserva su propia ventana aun cuando otro active la limpieza. */
  ventanaMs: number;
  /** Permite desalojar la entrada menos usada si llega una lluvia de IPs únicas. */
  ultimoAcceso: number;
}

const MAX_CLAVES_EN_MEMORIA = 10_000;

/**
 * Limitador de solicitudes por IP para endpoints publicos.
 *
 * Se implementa en el proyecto, sin agregar dependencias: el backend es un
 * monolito de un solo proceso (ver decision--monolito-modular), asi que una
 * ventana deslizante en memoria alcanza y evita sumar @nestjs/throttler.
 *
 * ATENCION si esto alguna vez corre en mas de una instancia: el contador es por
 * proceso, de modo que N instancias multiplican por N el limite efectivo. En ese
 * escenario hay que mover el contador a un almacen compartido.
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly ventanas = new Map<string, Ventana>();
  private ultimaLimpieza = 0;

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const opciones = this.reflector.getAllAndOverride<RateLimitOpciones>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!opciones) return true;

    const request = context.switchToHttp().getRequest<Request>();
    // req.ip respeta 'trust proxy' de main.ts, asi que detras de un proxy es la IP
    // real y no la del balanceador. Sin proxy configurado no se puede falsear.
    const clave = `${opciones.nombre}:${request.ip ?? 'sin-ip'}`;
    const ahora = Date.now();

    this.limpiar(ahora);

    let ventana = this.ventanas.get(clave);
    if (!ventana) {
      this.reservarEspacio();
      ventana = { golpes: [], bloqueadoHasta: 0, ventanaMs: opciones.ventanaMs, ultimoAcceso: ahora };
    }
    ventana.ultimoAcceso = ahora;

    if (ventana.bloqueadoHasta > ahora) {
      throw this.demasiadas(ventana.bloqueadoHasta - ahora);
    }

    ventana.golpes = ventana.golpes.filter((marca) => ahora - marca < opciones.ventanaMs);

    if (ventana.golpes.length >= opciones.maximo) {
      ventana.bloqueadoHasta = ahora + opciones.penalizacionMs;
      this.ventanas.set(clave, ventana);
      throw this.demasiadas(opciones.penalizacionMs);
    }

    ventana.golpes.push(ahora);
    this.ventanas.set(clave, ventana);
    return true;
  }

  /** Mensaje para una persona, no para un desarrollador (ver rule--espanol-y-auditoria). */
  private demasiadas(restanteMs: number): HttpException {
    const minutos = Math.max(1, Math.ceil(restanteMs / 60000));
    return new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: `Recibimos varios envíos desde esta conexión. Esperá ${minutos} minuto${minutos === 1 ? '' : 's'} e intentá de nuevo.`,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  /** Evita que el Map crezca sin techo con IPs que no vuelven. */
  private limpiar(ahora: number) {
    if (ahora - this.ultimaLimpieza < 60_000) return;
    this.ultimaLimpieza = ahora;
    for (const [clave, ventana] of this.ventanas) {
      const vencida = ventana.golpes.every((marca) => ahora - marca >= ventana.ventanaMs);
      if (vencida && ventana.bloqueadoHasta <= ahora) this.ventanas.delete(clave);
    }
  }

  /** Acota memoria incluso si un atacante rota IPs antes del siguiente barrido. */
  private reservarEspacio() {
    if (this.ventanas.size < MAX_CLAVES_EN_MEMORIA) return;
    let candidata: string | undefined;
    let accesoMasAntiguo = Infinity;
    for (const [clave, ventana] of this.ventanas) {
      if (ventana.ultimoAcceso < accesoMasAntiguo) {
        candidata = clave;
        accesoMasAntiguo = ventana.ultimoAcceso;
      }
    }
    if (candidata) this.ventanas.delete(candidata);
  }
}
