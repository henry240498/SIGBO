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

/**
 * ¿La falla es de conexion (el pedido no llego o no volvio) y no una respuesta del
 * servidor como 403 o 500? fetch rechaza con TypeError cuando no hay red; el tope de 30 s
 * tambien es "sin respuesta". El resto lo lanza la pantalla con el mensaje del servidor.
 */
export function esFallaDeConexion(e: unknown): boolean {
  return e instanceof TypeError || (e instanceof Error && e.message === MENSAJE_TOPE_INTENTO);
}

/** Lo que anuncia la marca de actualizacion ante una falla. */
export function textoDeFalla(sinConexion: boolean): string {
  return sinConexion ? 'Sin conexión con el servidor' : 'No se pudo actualizar';
}

/**
 * Nunca dos cargas en vuelo. Un pedido manual (p. ej. despues de marcar una alerta como
 * atendida) que llega con una carga en vuelo no se descarta: deja UNA carga de seguimiento
 * para cuando termine, asi la pantalla no muestra el dato viejo hasta el proximo ciclo.
 */
export class ControlDeCargas {
  private enVuelo = false;
  private seguimiento = false;

  /** true: puede arrancar ya. false: hay una en vuelo (si era manual, queda una de seguimiento). */
  pedir(manual: boolean): boolean {
    if (!this.enVuelo) {
      this.enVuelo = true;
      return true;
    }
    if (manual) this.seguimiento = true;
    return false;
  }

  /** Termina la carga en vuelo; true si hay que hacer la de seguimiento (y la consume). */
  terminar(): boolean {
    this.enVuelo = false;
    const seguir = this.seguimiento;
    this.seguimiento = false;
    return seguir;
  }

  /** Al desactivar la actualizacion, se olvida un seguimiento pendiente. */
  olvidar(): void {
    this.seguimiento = false;
  }
}
