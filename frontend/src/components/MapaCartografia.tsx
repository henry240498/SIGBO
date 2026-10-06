'use client';

import { useEffect, useRef } from 'react';
import type { LayerGroup, Map as LeafletMap, Marker } from 'leaflet';
import type { Hidrante, PuntoRiesgo } from '@/lib/cartografia';

const COLOR_HIDRANTE: Record<string, string> = {
  OPERATIVO: '#1f8a5b',
  FUERA_SERVICIO: '#c0392b',
  SIN_VERIFICAR: '#8a8f98',
};

const COLOR_RIESGO: Record<string, string> = {
  BAJO: '#2f6fdb',
  MEDIO: '#d9a22b',
  ALTO: '#d9822b',
  CRITICO: '#c0392b',
};

interface Props {
  hidrantes: Hidrante[];
  puntos: PuntoRiesgo[];
  /** Punto elegido con un clic para cargar uno nuevo. */
  seleccion: { lat: number; lon: number } | null;
  /** Si se pasa, un clic en el mapa elige una coordenada. */
  onElegir?: (lat: number, lon: number) => void;
}

/** Mapa operativo: hidrantes (circulos) y puntos de riesgo (rombos). Leaflet + OpenStreetMap. */
export default function MapaCartografia({ hidrantes, puntos, seleccion, onElegir }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<LeafletMap | null>(null);
  const capaRef = useRef<LayerGroup | null>(null);
  const marcadorSel = useRef<Marker | null>(null);
  const alElegir = useRef(onElegir);
  alElegir.current = onElegir;
  const encuadrado = useRef(false);

  useEffect(() => {
    let cancelado = false;
    import('leaflet').then((L) => {
      if (cancelado || !contenedor.current || mapaRef.current) return;
      const mapa = L.map(contenedor.current).setView([-25.3, -57.6], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapa);
      capaRef.current = L.layerGroup().addTo(mapa);
      mapa.on('click', (e: { latlng: { lat: number; lng: number } }) => alElegir.current?.(e.latlng.lat, e.latlng.lng));
      mapaRef.current = mapa;
    });
    return () => {
      cancelado = true;
      mapaRef.current?.remove();
      mapaRef.current = null;
      capaRef.current = null;
      marcadorSel.current = null;
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
        const bounds: Array<[number, number]> = [];
        for (const h of hidrantes) {
          bounds.push([h.latitud, h.longitud]);
          L.circleMarker([h.latitud, h.longitud], {
            radius: 8, color: '#ffffff', weight: 2, fillColor: COLOR_HIDRANTE[h.estado] ?? '#555555', fillOpacity: 0.95,
          })
            .bindTooltip(`Hidrante ${h.codigo} — ${h.estado.replace('_', ' ')}${h.caudalLpm ? ` · ${h.caudalLpm} l/min` : ''}`)
            .addTo(capa);
        }
        for (const p of puntos) {
          bounds.push([p.latitud, p.longitud]);
          L.marker([p.latitud, p.longitud], {
            icon: L.divIcon({
              className: '',
              iconSize: [18, 18],
              iconAnchor: [9, 9],
              html: `<div style="width:14px;height:14px;transform:rotate(45deg);background:${COLOR_RIESGO[p.nivelRiesgo] ?? '#555'};border:2px solid #fff;box-shadow:0 0 2px #000"></div>`,
            }),
          })
            .bindTooltip(`${p.nombre} — riesgo ${p.nivelRiesgo.toLowerCase()}`)
            .addTo(capa);
        }
        if (!encuadrado.current && bounds.length > 0) {
          mapa.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 16 });
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
  }, [hidrantes, puntos]);

  useEffect(() => {
    import('leaflet').then((L) => {
      const mapa = mapaRef.current;
      if (!mapa) return;
      marcadorSel.current?.remove();
      marcadorSel.current = null;
      if (seleccion) {
        marcadorSel.current = L.marker([seleccion.lat, seleccion.lon]).addTo(mapa).bindTooltip('Ubicación elegida');
      }
    });
  }, [seleccion]);

  return (
    <div
      ref={contenedor}
      role="img"
      aria-label="Mapa de hidrantes y puntos de riesgo"
      style={{ height: 420, borderRadius: 10, border: '1px solid var(--line)' }}
    />
  );
}
