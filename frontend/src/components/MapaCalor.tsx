'use client';

import { useEffect, useRef } from 'react';
import type { LayerGroup, Map as LeafletMap } from 'leaflet';
import type { CeldaCalor } from '@/lib/indicadores';

/** Mapa de calor sin librerias extra: un circulo por celda, mas grande y mas opaco cuanto mas servicios. */
export default function MapaCalor({ celdas, celdaM }: { celdas: CeldaCalor[]; celdaM: number }) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<LeafletMap | null>(null);
  const capaRef = useRef<LayerGroup | null>(null);
  const encuadrado = useRef(false);

  useEffect(() => {
    let cancelado = false;
    import('leaflet').then((L) => {
      if (cancelado || !contenedor.current || mapaRef.current) return;
      const mapa = L.map(contenedor.current).setView([-25.3, -57.6], 11);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapa);
      capaRef.current = L.layerGroup().addTo(mapa);
      mapaRef.current = mapa;
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
        const maximo = Math.max(1, ...celdas.map((c) => c.cantidad));
        for (const c of celdas) {
          const peso = c.cantidad / maximo;
          L.circle([c.latitud, c.longitud], {
            radius: Math.max(celdaM * 0.5, celdaM * (0.5 + peso)),
            stroke: false,
            fillColor: '#c0392b',
            fillOpacity: 0.2 + 0.6 * peso,
          })
            .bindTooltip(`${c.cantidad} servicio${c.cantidad === 1 ? '' : 's'}`)
            .addTo(capa);
        }
        if (!encuadrado.current && celdas.length > 0) {
          mapa.fitBounds(L.latLngBounds(celdas.map((c) => [c.latitud, c.longitud] as [number, number])), { padding: [40, 40], maxZoom: 15 });
          encuadrado.current = true;
        }
      });
    };
    dibujar();
    const espera = setTimeout(dibujar, 600);
    return () => {
      cancelado = true;
      clearTimeout(espera);
    };
  }, [celdas, celdaM]);

  return <div ref={contenedor} role="img" aria-label="Mapa de calor de servicios" style={{ height: 420, borderRadius: 10, border: '1px solid var(--line)' }} />;
}
