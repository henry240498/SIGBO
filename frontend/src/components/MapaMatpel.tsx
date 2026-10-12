'use client';

import { useEffect, useRef, useState } from 'react';
import type { Map as Mapa } from 'leaflet';
import type { GeometriaMatpel } from '@/lib/matpel';

/** Representación relativa sin enviar coordenadas a proveedores de teselas. */
export default function MapaMatpel({ datos }: { datos: GeometriaMatpel }) {
  const contenedor = useRef<HTMLDivElement>(null); const mapa = useRef<Mapa | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let vigente = true;
    void import('leaflet').then(L => {
      if (!vigente || !contenedor.current) return;
      const centro = datos.aislamiento?.centro ?? datos.proteccion?.coordinates[0][0];
      if (!centro) return;
      const m = L.map(contenedor.current).setView([centro[1], centro[0]], 13); mapa.current = m;
      const capas: import('leaflet').Layer[] = [];
      if (datos.aislamiento) {
        const a = datos.aislamiento;
        capas.push(L.circle([a.centro[1], a.centro[0]], { radius: a.radioM, color: '#154e85', dashArray: '6 4', fillOpacity: 0.1 }).bindTooltip(`Aislamiento inicial · ${a.radioM} m`).addTo(m));
      }
      if (datos.proteccion) {
        const p = datos.proteccion;
        const feature: import('geojson').Feature<import('geojson').Polygon> = { type: 'Feature', geometry: { type: p.type, coordinates: p.coordinates }, properties: {} };
        capas.push(L.geoJSON(feature, { style: { color: '#146b78', fillOpacity: 0.15 } }).bindTooltip(`Acción protectora · ${p.distanciaM} m a favor del viento`).addTo(m));
      }
      if (capas.length) m.fitBounds(L.featureGroup(capas).getBounds(), { padding: [24, 24], maxZoom: 18 });
    }).catch(error => { console.error('Error al representar las zonas MATPEL:', error instanceof Error ? error.message : 'Error de mapa'); if (vigente) setError('No se pudo cargar el mapa. Las distancias y condiciones siguen disponibles en texto.'); });
    return () => { vigente = false; mapa.current?.remove(); mapa.current = null; };
  }, [datos]);
  if (error) return <p role="status">{error}</p>;
  return <div style={{ display: 'grid', gap: 8 }}>
    <p>Representación relativa calculada por SIGBO sobre una esfera. Norte arriba. Círculo punteado: aislamiento; cuadrado: protección a favor del viento. No es un modelo de dispersión.</p>
    <div ref={contenedor} role="img" aria-label="Zonas de aislamiento y protección inicial; detalle equivalente en texto" style={{ height: 340, background: '#eef2f6', border: '1px solid var(--line)', borderRadius: 8 }} />
    <p>Ubicación: {datos.calidadUbicacion.toLowerCase().replaceAll('_', ' ')} · Viento: {datos.calidadViento.toLowerCase().replaceAll('_', ' ')} · Precisión de ubicación: {datos.precisionM === null ? 'desconocida' : `${datos.precisionM} m`}.</p>
    {datos.proteccion && <p>Viento desde {datos.proteccion.vientoDesdeGrados}° · Longitud y ancho: {datos.proteccion.distanciaM} m.</p>}
  </div>;
}
