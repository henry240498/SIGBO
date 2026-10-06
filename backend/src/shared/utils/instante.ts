/** Hasta cuanto tiempo atras se acepta la hora de un hecho registrado sin conexion. */
export const MAX_ATRASO_MS = 72 * 3_600_000;

/**
 * Hora en que ocurrio un hecho que el celular registro sin conexion y envio despues.
 * Nunca se confia ciegamente en el reloj del dispositivo:
 *  - invalida, vacia o futura  -> ahora (servidor)
 *  - mas vieja que 72 horas    -> ahora (un reloj desajustado no reescribe el pasado)
 *  - `minimo` (hito anterior)  -> el resultado nunca queda antes de el
 */
export function instanteDelHecho(valor: string | undefined | null, ahora: Date = new Date(), minimo?: Date | null): Date {
  let t = ahora;
  if (valor) {
    const d = new Date(valor);
    const ms = d.getTime();
    if (Number.isFinite(ms) && ms <= ahora.getTime() && ahora.getTime() - ms <= MAX_ATRASO_MS) t = d;
  }
  if (minimo && t.getTime() < new Date(minimo).getTime()) return new Date(Math.min(new Date(minimo).getTime(), ahora.getTime()));
  return t;
}
