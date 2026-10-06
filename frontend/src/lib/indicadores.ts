import { apiFetch } from './api';
import { leer } from './flota';

export interface Estadistica {
  n: number;
  promedio: number | null;
  mediana: number | null;
  p90: number | null;
  maximo: number | null;
}

export interface Conteo {
  clave: string;
  cantidad: number;
}

export interface IndicadoresOperativos {
  desde: string;
  hasta: string;
  totalServicios: number;
  sinDespacho: number;
  tiempoDeSalida: Estadistica;
  tiempoDeRespuesta: Estadistica;
  tiempoDeViaje: Estadistica;
  porTipo: Conteo[];
  porGravedad: Conteo[];
  porFranja: Conteo[];
  porDiaSemana: Conteo[];
  porMovil: Array<{ movil: string; salidas: number; viaje: Estadistica }>;
}

export interface CeldaCalor {
  latitud: number;
  longitud: number;
  cantidad: number;
}

export interface MapaCalorDatos {
  serviciosEnElPeriodo: number;
  serviciosConUbicacion: number;
  celdaM: number;
  celdas: CeldaCalor[];
}

export const cargarIndicadores = async (desde: string, hasta: string) =>
  leer<IndicadoresOperativos>(await apiFetch(`/indicadores/operativos?desde=${desde}&hasta=${hasta}`));

export const cargarCalor = async (desde: string, hasta: string, celda: number) =>
  leer<MapaCalorDatos>(await apiFetch(`/indicadores/calor?desde=${desde}&hasta=${hasta}&celda=${celda}`));

/** Segundos a texto corto: 45 s, 7 min 30 s, 1 h 5 min. */
export function formatoDuracion(seg: number | null): string {
  if (seg === null) return '—';
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  const s = seg % 60;
  if (h > 0) return `${h} h ${m} min`;
  if (m > 0) return `${m} min${s ? ` ${s} s` : ''}`;
  return `${s} s`;
}
