/** Consulta periodica de las pantallas en vivo (spec 2026-10-09 §5.6). Logica pura. */

export const INTENTO_MAXIMO_MS = 60_000;

/** Tope de un intento: un pedido colgado no puede dejar el panel congelado. */
export const TOPE_INTENTO_MS = 30_000;

/** Tras cada falla seguida se espera el doble, hasta un minuto. */
export function siguienteEspera(baseMs: number, fallosSeguidos: number): number {
  if (fallosSeguidos <= 0) return baseMs;
  return Math.min(baseMs * 2 ** fallosSeguidos, INTENTO_MAXIMO_MS);
}

export function haceCuanto(desde: Date | null, ahora: Date): string {
  if (!desde) return 'nunca';
  const s = Math.max(0, Math.round((ahora.getTime() - desde.getTime()) / 1000));
  if (s < 5) return 'recién';
  if (s < 60) return `hace ${s} s`;
  const m = Math.round(s / 60);
  if (m < 60) return `hace ${m} min`;
  return `hace ${Math.round(m / 60)} h`;
}

/** Mensaje para la persona cuando un intento no responde dentro de TOPE_INTENTO_MS. */
export const MENSAJE_TOPE_INTENTO = 'El servidor no respondió en 30 s.';

/**
 * Espera `p` como mucho `ms`. Si no llega a tiempo, rechaza con `mensaje`. El temporizador
 * se limpia en cuanto `p` termina; si `p` llega tarde, su resultado se descarta sin error.
 */
export function conTope<T>(p: Promise<T>, ms: number, mensaje: string): Promise<T> {
  let reloj: ReturnType<typeof setTimeout> | undefined;
  const tope = new Promise<never>((_, rechazar) => {
    reloj = setTimeout(() => rechazar(new Error(mensaje)), ms);
  });
  return Promise.race([p, tope]).finally(() => clearTimeout(reloj));
}
