/** Funciones puras de los indicadores operativos (4.1 y 4.2): se prueban sin base de datos. */

export interface Estadistica {
  n: number;
  promedio: number | null;
  mediana: number | null;
  p90: number | null;
  maximo: number | null;
}

/** Percentil por el metodo del rango mas cercano (p entre 0 y 100) sobre una lista ya ordenada. */
export function percentil(ordenados: number[], p: number): number | null {
  if (ordenados.length === 0) return null;
  const rango = Math.ceil((p / 100) * ordenados.length);
  return ordenados[Math.min(ordenados.length, Math.max(1, rango)) - 1];
}

/** Resumen de una lista de duraciones en segundos. Ignora valores no finitos o negativos. */
export function estadistica(valores: number[]): Estadistica {
  const v = valores.filter((x) => Number.isFinite(x) && x >= 0).sort((a, b) => a - b);
  if (v.length === 0) return { n: 0, promedio: null, mediana: null, p90: null, maximo: null };
  const suma = v.reduce((s, x) => s + x, 0);
  return {
    n: v.length,
    promedio: Math.round(suma / v.length),
    mediana: percentil(v, 50),
    p90: percentil(v, 90),
    maximo: v[v.length - 1],
  };
}

export const FRANJAS = ['00-06', '06-12', '12-18', '18-24'] as const;

/** Franja horaria (hora local) de un instante. */
export function franjaHoraria(fecha: Date): (typeof FRANJAS)[number] {
  return FRANJAS[Math.floor(new Date(fecha).getHours() / 6)];
}

export const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'] as const;

/** Diferencia en segundos entre dos instantes; null si falta alguno o el orden es invertido. */
export function segundosEntre(desde: Date | null | undefined, hasta: Date | null | undefined): number | null {
  if (!desde || !hasta) return null;
  const s = (new Date(hasta).getTime() - new Date(desde).getTime()) / 1000;
  return s >= 0 ? Math.round(s) : null;
}

/** Cuenta ocurrencias por clave y devuelve [{clave, cantidad}] de mayor a menor. */
export function contarPor<T>(items: T[], clave: (i: T) => string): Array<{ clave: string; cantidad: number }> {
  const m = new Map<string, number>();
  for (const i of items) m.set(clave(i), (m.get(clave(i)) ?? 0) + 1);
  return [...m.entries()].map(([k, cantidad]) => ({ clave: k, cantidad })).sort((a, b) => b.cantidad - a.cantidad || a.clave.localeCompare(b.clave));
}

const METROS_POR_GRADO_LAT = 111_320;

export interface CeldaCalor {
  latitud: number;
  longitud: number;
  cantidad: number;
}

/**
 * Agrupa puntos en una grilla de `celdaM` metros y devuelve el centro de cada
 * celda con la cantidad de puntos. El ancho de la celda en longitud se corrige
 * por la latitud para que las celdas sean aproximadamente cuadradas.
 */
export function agruparEnGrilla(puntos: Array<{ lat: number; lon: number }>, celdaM: number): CeldaCalor[] {
  const dLat = celdaM / METROS_POR_GRADO_LAT;
  const celdas = new Map<string, { cantidad: number; lat: number; lon: number }>();
  for (const p of puntos) {
    if (!Number.isFinite(p.lat) || !Number.isFinite(p.lon)) continue;
    const dLon = dLat / Math.max(0.01, Math.cos((p.lat * Math.PI) / 180));
    const fila = Math.floor(p.lat / dLat);
    const col = Math.floor(p.lon / dLon);
    const clave = `${fila}:${col}`;
    const c = celdas.get(clave);
    if (c) c.cantidad += 1;
    else celdas.set(clave, { cantidad: 1, lat: (fila + 0.5) * dLat, lon: (col + 0.5) * dLon });
  }
  return [...celdas.values()]
    .map((c) => ({ latitud: Number(c.lat.toFixed(6)), longitud: Number(c.lon.toFixed(6)), cantidad: c.cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);
}
