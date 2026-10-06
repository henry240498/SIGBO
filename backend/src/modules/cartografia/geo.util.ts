const RADIO_TIERRA_M = 6371008.8;

const aRadianes = (grados: number) => (grados * Math.PI) / 180;

/** Distancia en metros entre dos puntos (formula de haversine). */
export function distanciaMetros(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = aRadianes(lat2 - lat1);
  const dLon = aRadianes(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(aRadianes(lat1)) * Math.cos(aRadianes(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * RADIO_TIERRA_M * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Ordena por cercania a (lat, lon) y descarta lo que quede fuera de `radioM`. */
export function masCercanos<T extends { latitud: number | string; longitud: number | string }>(
  items: T[],
  lat: number,
  lon: number,
  radioM: number,
  limite: number,
): Array<T & { distanciaM: number }> {
  return items
    .map((i) => ({ ...i, distanciaM: Math.round(distanciaMetros(lat, lon, Number(i.latitud), Number(i.longitud))) }))
    .filter((i) => i.distanciaM <= radioM)
    .sort((a, b) => a.distanciaM - b.distanciaM)
    .slice(0, limite);
}
