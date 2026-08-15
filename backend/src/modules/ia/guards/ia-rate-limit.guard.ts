import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { IaConfiguracionService } from '../ia-configuracion.service';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';

interface Ventana {
  golpesMinuto: number[];
  golpesHora: number[];
}

/** Limitador de consultas al chat de IA por usuario: mismo patron de
 * ventana deslizante en memoria que denuncias/guards/rate-limit.guard.ts
 * (decision--rate-limit-propio). Apagado por defecto (`limiteActivo=false`):
 * la institucion pidio explicitamente un asistente "sin limites, no ligado
 * a tokens, nada" -- este guard es una proteccion tecnica anti-abuso
 * opcional que un administrador puede activar puntualmente, nunca un
 * presupuesto de uso. */
@Injectable()
export class IaRateLimitGuard implements CanActivate {
  private readonly ventanas = new Map<string, Ventana>();
  private ultimaLimpieza = 0;

  constructor(private readonly configuracionService: IaConfiguracionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const usuario = request.user;
    if (!usuario) return true; // JwtAuthGuard ya deberia haber rechazado esto antes

    const config = await this.configuracionService.obtener();
    if (!config.limiteActivo) return true;

    const ahora = Date.now();
    this.limpiar(ahora);

    const ventana = this.ventanas.get(usuario.id) ?? { golpesMinuto: [], golpesHora: [] };
    ventana.golpesMinuto = ventana.golpesMinuto.filter((m) => ahora - m < 60_000);
    ventana.golpesHora = ventana.golpesHora.filter((m) => ahora - m < 3_600_000);

    if (ventana.golpesMinuto.length >= config.limiteConsultasMinuto) {
      throw new HttpException({ statusCode: HttpStatus.TOO_MANY_REQUESTS, message: 'Estás consultando a Snoopy muy seguido. Esperá un minuto e intentá de nuevo.' }, HttpStatus.TOO_MANY_REQUESTS);
    }
    if (ventana.golpesHora.length >= config.limiteConsultasHora) {
      throw new HttpException({ statusCode: HttpStatus.TOO_MANY_REQUESTS, message: 'Alcanzaste el límite de consultas a Snoopy para esta hora. Probá de nuevo más tarde.' }, HttpStatus.TOO_MANY_REQUESTS);
    }

    ventana.golpesMinuto.push(ahora);
    ventana.golpesHora.push(ahora);
    this.ventanas.set(usuario.id, ventana);
    return true;
  }

  private limpiar(ahora: number) {
    if (ahora - this.ultimaLimpieza < 60_000) return;
    this.ultimaLimpieza = ahora;
    for (const [clave, ventana] of this.ventanas) {
      if (ventana.golpesHora.every((m) => ahora - m >= 3_600_000)) this.ventanas.delete(clave);
    }
  }
}
