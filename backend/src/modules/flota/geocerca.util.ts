import { distanciaMetros } from '../cartografia/geo.util';

export const RADIO_GEOCERCA_POR_DEFECTO_M = 300;
/** Una posicion mas vieja que esto no prueba nada sobre donde esta el movil ahora. */
export const POSICION_FRESCA_MS = 15 * 60_000;

export function radioGeocerca(env: string | undefined = process.env.GEOCERCA_METROS): number {
  const n = Number(env);
  return Number.isFinite(n) && n >= 50 && n <= 20_000 ? n : RADIO_GEOCERCA_POR_DEFECTO_M;
}

/**
 * Un movil figura EN_CUARTEL pero el GPS lo ubica lejos del cuartel: probablemente salio sin
 * registrar el despacho (o el estado quedo desactualizado). Solo AVISA; no cambia ningun estado:
 * decidir que paso es del operador.
 */
export function movilFueraDelCuartel(
  movil: { estadoOperativo: string },
  posicion: { latitud: number | string; longitud: number | string; registradoEn: Date | string } | undefined,
  cuartel: { latitud: number | string | null; longitud: number | string | null } | undefined,
  ahora: Date = new Date(),
  radioM: number = radioGeocerca(),
): { fuera: boolean; distanciaM: number | null } {
  if (movil.estadoOperativo !== 'EN_CUARTEL' || !posicion || !cuartel || cuartel.latitud === null || cuartel.longitud === null) {
    return { fuera: false, distanciaM: null };
  }
  if (ahora.getTime() - new Date(posicion.registradoEn).getTime() > POSICION_FRESCA_MS) return { fuera: false, distanciaM: null };
  const d = Math.round(distanciaMetros(Number(cuartel.latitud), Number(cuartel.longitud), Number(posicion.latitud), Number(posicion.longitud)));
  return { fuera: d > radioM, distanciaM: d };
}
