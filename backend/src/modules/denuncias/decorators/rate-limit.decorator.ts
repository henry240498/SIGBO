import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rate_limit';

export interface RateLimitOpciones {
  /** Identifica el contador; distintos endpoints no comparten cupo. */
  nombre: string;
  /** Tamano de la ventana deslizante. */
  ventanaMs: number;
  /** Solicitudes permitidas por IP dentro de la ventana. */
  maximo: number;
  /** Cuanto queda bloqueada la IP al superar el maximo. */
  penalizacionMs: number;
}

/**
 * Limita las solicitudes por IP de un endpoint publico.
 *
 * Los numeros deben permitir denunciar sin dificultad y frenar el abuso: una
 * persona legitima manda una denuncia, no veinte (ver la seccion 30 del pedido).
 */
export const RateLimit = (opciones: RateLimitOpciones) => SetMetadata(RATE_LIMIT_KEY, opciones);
