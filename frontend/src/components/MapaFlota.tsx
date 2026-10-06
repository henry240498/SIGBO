'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap, LayerGroup } from 'leaflet';
import type { PosicionMovil } from '@/lib/flota';

/** Colores de relleno del marcador por estado operativo (cartografia, no texto). */
const COLOR: Record<string, string> = {
  EN_CUARTEL: '#1f8a5b',
  DESPACHADO: '#d9822b',
  EN_SERVICIO: '#c0392b',
  REGRESANDO: '#2f6fdb',
};

/** Capa cartografica de la flota: Leaflet + OpenStreetMap (open source, sin
 * clave de API). Solo dibuja; la pantalla es dueña de los datos. Se carga
 * con next/dynamic ssr:false porque Leaflet exige `window`. */
export default function MapaFlota({ posiciones }: { posiciones: PosicionMovil[] }) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<LeafletMap | null>(null);
  const capaRef = useRef<LayerGroup | null>(null);
  const encuadrado = useRef(false);

  useEffect(() => {
    let cancelado = false;
    import('leaflet').then((L) => {
      if (cancelado || !contenedor.current || mapaRef.current) return;
      const mapa = L.map(contenedor.current).setView([-25.3, -57.6], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapa);
      capaRef.current = L.layerGroup().addTo(mapa);
      mapaRef.current = mapa;
      // fuerza un redibujo de los marcadores ya recibidos
      mapa.fire('moveend');
    });
    return () => {
      cancelado = true;
      mapaRef.current?.remove();
      mapaRef.current = null;
      capaRef.current = null;
      encuadrado.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelado = false;
    const dibujar = () => {
      import('leaflet').then((L) => {
        const mapa = mapaRef.current;
        const capa = capaRef.current;
        if (cancelado || !mapa || !capa) return;
        capa.clearLayers();
        for (const p of posiciones) {
          const hace = Math.max(0, Math.round((Date.now() - new Date(p.registradoEn).getTime()) / 60000));
          L.circleMarker([p.latitud, p.longitud], {
            radius: 11,
            color: '#ffffff',
            weight: 2,
            fillColor: COLOR[p.estadoOperativo] ?? '#555555',
            fillOpacity: 0.95,
          })
            .bindTooltip(`${p.numeroInterno}${p.alias ? ' · ' + p.alias : ''} — ${p.estadoOperativo.replace('_', ' ')} (hace ${hace} min)`)
            .addTo(capa);
        }
        // Encuadra una sola vez; despues respeta el zoom que el operador eligio.
        if (!encuadrado.current && posiciones.length > 0) {
          mapa.fitBounds(L.latLngBounds(posiciones.map((p) => [p.latitud, p.longitud] as [number, number])), { padding: [40, 40], maxZoom: 15 });
          encuadrado.current = true;
        }
      });
    };
    dibujar();
    // si el mapa todavia se esta creando, reintenta cuando exista
    const espera = setTimeout(dibujar, 600);
    return () => {
      cancelado = true;
      clearTimeout(espera);
    };
  }, [posiciones]);

  return <div ref={contenedor} role="img" aria-label="Mapa con la posición de los móviles" style={{ height: 460, borderRadius: 10, border: '1px solid var(--line)' }} />;
}
