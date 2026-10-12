import type { MotorMatpelService } from './motor-matpel.service';
import type { CatalogoMatpel, ParametrosMatpel } from './matpel-modelo';

type Evaluacion = ReturnType<MotorMatpelService['evaluar']>;
type Posicion = [number, number]; // GeoJSON: longitud, latitud.
const RADIO_TIERRA_M = 6371008.8; // Modelo esférico complementario de SIGBO, no dato GRE.
const rad = (v: number) => v * Math.PI / 180;
const deg = (v: number) => v * 180 / Math.PI;

/** Proyección geodésica esférica de un desplazamiento local este/norte. */
function desplazar(origen: Posicion, este: number, norte: number): Posicion {
  const distancia = Math.hypot(este, norte) / RADIO_TIERRA_M;
  const rumbo = Math.atan2(este, norte); const lat = rad(origen[1]); const lon = rad(origen[0]);
  const lat2 = Math.asin(Math.sin(lat) * Math.cos(distancia) + Math.cos(lat) * Math.sin(distancia) * Math.cos(rumbo));
  const lon2 = lon + Math.atan2(Math.sin(rumbo) * Math.sin(distancia) * Math.cos(lat), Math.cos(distancia) - Math.sin(lat) * Math.sin(lat2));
  return [((deg(lon2) + 540) % 360) - 180, deg(lat2)];
}

/** GRE PDF297 / impresa295: círculo de aislamiento y cuadrado a favor del viento.
 * Representación complementaria; no calcula concentraciones ni órdenes SCI. */
export function geometriaMatpel(e: Evaluacion, p: ParametrosMatpel, c: CatalogoMatpel) {
  const motivos: string[] = [];
  const regla = c.reglas.find(r => r.codigo === 'R25');
  const resultado = { versionGeometria: 'sigbo-gre-figura-1', modelo: 'ESFERA_6371008_8_M',
    finalidad: 'ORIENTACION_INICIAL_NO_MODELO_DISPERSION', versionGreId: e.versionGreId, inputsHash: e.inputsHash,
    referenciaIds: regla ? [regla.referenciaId] : [], calidadUbicacion: p.ubicacion.certeza, calidadViento: p.viento.certeza,
    precisionM: p.ubicacion.valor?.precisionM ?? null, aislamiento: null as null | { centro: Posicion; radioM: number; referenciaIds: string[] },
    proteccion: null as null | { type: 'Polygon'; coordinates: Posicion[][]; distanciaM: number; anchoM: number; vientoDesdeGrados: number; referenciaIds: string[] }, motivos };
  if (!regla) { motivos.push('La edición no tiene la referencia de la figura GRE.'); return resultado; }
  const ubicacion = p.ubicacion.valor;
  if (!ubicacion) { motivos.push('Ubicación del derrame desconocida.'); return resultado; }
  // Límites de representación SIGBO; nunca se presentan como límite de peligro GRE.
  if (Math.abs(ubicacion.latitud) > 85) { motivos.push('La representación disponible no cubre zonas polares.'); return resultado; }
  if (p.incendio.valor !== false) { motivos.push('Incendio presente o desconocido: consultar guía y condiciones antes de representar zonas de derrame.'); return resultado; }
  if (p.contactoAgua.valor !== 'TIERRA' && e.tabla2.filaIds.length) { motivos.push('Material reactivo en agua: la fuente puede desplazarse; verificar origen efectivo antes de representar zonas.'); return resultado; }
  const centro: Posicion = [ubicacion.longitud, ubicacion.latitud];
  const distancia = (a: Evaluacion['aislamiento']) => {
    if (a.estado !== 'APLICABLE' || !a.celdas.length || a.celdas.some(x => x.modificador || x.estadoDato !== 'DATO' || x.valorDecimal === null)) return null;
    const valores = a.celdas.map(x => x.unidadOriginal === 'm' ? Number(x.valorDecimal) : x.unidadOriginal === 'km' ? Number(x.valorDecimal) * 1000 : NaN);
    if (valores.some(x => !Number.isFinite(x) || x <= 0 || x > 20000) || valores.some(x => x !== valores[0])) return null;
    return valores[0];
  };
  const aislamiento = distancia(e.aislamiento); const proteccion = distancia(e.proteccion);
  if (aislamiento !== null) resultado.aislamiento = { centro, radioM: aislamiento, referenciaIds: e.aislamiento.referenciaIds };
  else motivos.push('Aislamiento sin distancia única, positiva y aplicable para la representación.');
  if (proteccion === null) { motivos.push('Protección sin distancia única y acotada; un modificador + no define borde máximo.'); return resultado; }
  const viento = p.viento.valor;
  if (!viento || viento.direccionDesdeGrados === null || viento.velocidadDecimal === null || Number(viento.velocidadDecimal) <= 0) {
    motivos.push('Falta dirección desde la que sopla el viento y velocidad positiva observada.'); return resultado;
  }
  const rumbo = rad((viento.direccionDesdeGrados + 180) % 360);
  const punto = (adelante: number, lateral: number) => desplazar(centro,
    adelante * Math.sin(rumbo) + lateral * Math.cos(rumbo), adelante * Math.cos(rumbo) - lateral * Math.sin(rumbo));
  const vertices = [punto(0, -proteccion / 2), punto(0, proteccion / 2), punto(proteccion, proteccion / 2), punto(proteccion, -proteccion / 2)];
  if (vertices.some(v => Math.abs(v[0] - centro[0]) > 180)) {
    motivos.push('El cuadrado cruza el antimeridiano; la representación disponible requiere partición geográfica.'); return resultado;
  }
  resultado.proteccion = { type: 'Polygon', coordinates: [[...vertices, vertices[0]]], distanciaM: proteccion, anchoM: proteccion,
    vientoDesdeGrados: viento.direccionDesdeGrados, referenciaIds: e.proteccion.referenciaIds };
  return resultado;
}
