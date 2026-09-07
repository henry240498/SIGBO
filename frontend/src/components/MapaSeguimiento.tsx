'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap, Marker as LeafletMarker, Polyline as LeafletPolyline } from 'leaflet';
import type { EventoGeografico, PruebaComunicacion, PuntoRuta } from '@/lib/seguimiento-geografico';

export type ModoClicMapa = 'ninguno' | 'ruta' | 'evento' | 'prueba';

interface Props {
  cuartel: { lat: number; lon: number; nombre: string } | null;
  incidente: { lat: number; lon: number } | null;
  rutaPlanificada: PuntoRuta[] | null;
  rutaEnEdicion: PuntoRuta[];
  rutaRealizada: Array<{ lat: number; lon: number }>;
  eventos: EventoGeografico[];
  pruebas: PruebaComunicacion[];
  modoClic: ModoClicMapa;
  onMapClick: (lat: number, lon: number) => void;
}

const COLOR_NIVEL: Record<number, string> = { 5: '#16a34a', 4: '#16a34a', 3: '#eab308', 2: '#f97316', 1: '#dc2626' };

/** Capa cartográfica: Leaflet + OpenStreetMap (sin clave de API, sin
 * costo). Componente puramente de presentación + reporte de clics --
 * SeguimientoGeografico.tsx es dueño de todo el estado (qué modo está
 * activo, ruta en edición, etc.), esto solo dibuja y avisa onMapClick.
 * Cargado siempre con next/dynamic ssr:false: Leaflet exige `window`. */
export default function MapaSeguimiento({ cuartel, incidente, rutaPlanificada, rutaEnEdicion, rutaRealizada, eventos, pruebas, modoClic, onMapClick }: Props) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<LeafletMap | null>(null);
  const capaRef = useRef<{
    marcadores: LeafletMarker[];
    lineas: LeafletPolyline[];
  }>({ marcadores: [], lineas: [] });
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;
  const modoClicRef = useRef(modoClic);
  modoClicRef.current = modoClic;

  useEffect(() => {
    let cancelado = false;
    import('leaflet').then((L) => {
      if (cancelado || !contenedorRef.current || mapaRef.current) return;
      const centro: [number, number] = incidente ? [incidente.lat, incidente.lon] : cuartel ? [cuartel.lat, cuartel.lon] : [-25.3, -57.6];
      const mapa = L.map(contenedorRef.current).setView(centro, incidente || cuartel ? 14 : 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapa);
      mapa.on('click', (evento: { latlng: { lat: number; lng: number } }) => {
        if (modoClicRef.current !== 'ninguno') onMapClickRef.current(evento.latlng.lat, evento.latlng.lng);
      });
      mapaRef.current = mapa;
    });
    return () => {
      cancelado = true;
      mapaRef.current?.remove();
      mapaRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;
    let cancelado = false;
    import('leaflet').then((L) => {
      if (cancelado) return;
      capaRef.current.marcadores.forEach((m) => m.remove());
      capaRef.current.lineas.forEach((l) => l.remove());
      capaRef.current = { marcadores: [], lineas: [] };

      const icono = (color: string, emoji: string) => L.divIcon({
        html: `<div style="background:${color};width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);font-size:13px">${emoji}</div>`,
        className: '', iconSize: [26, 26], iconAnchor: [13, 13],
      });

      if (cuartel) {
        const m = L.marker([cuartel.lat, cuartel.lon], { icon: icono('#16a34a', '🏠') }).addTo(mapa).bindPopup(`<strong>Cuartel</strong><br/>${cuartel.nombre}`);
        capaRef.current.marcadores.push(m);
      }
      if (incidente) {
        const m = L.marker([incidente.lat, incidente.lon], { icon: icono('#dc2626', '🔴') }).addTo(mapa).bindPopup('<strong>Incidente</strong>');
        capaRef.current.marcadores.push(m);
      }
      if (rutaPlanificada && rutaPlanificada.length >= 2) {
        const linea = L.polyline(rutaPlanificada.map((p) => [p.lat, p.lon]), { color: '#2563eb', weight: 4, dashArray: '6 6' }).addTo(mapa);
        capaRef.current.lineas.push(linea);
        rutaPlanificada.forEach((p, i) => {
          const m = L.marker([p.lat, p.lon], { icon: icono('#2563eb', String(i + 1)) }).addTo(mapa).bindPopup(p.etiqueta || `Punto ${i + 1} de la ruta planificada`);
          capaRef.current.marcadores.push(m);
        });
      }
      if (rutaEnEdicion.length > 0) {
        if (rutaEnEdicion.length >= 2) {
          const linea = L.polyline(rutaEnEdicion.map((p) => [p.lat, p.lon]), { color: '#7c3aed', weight: 3 }).addTo(mapa);
          capaRef.current.lineas.push(linea);
        }
        rutaEnEdicion.forEach((p, i) => {
          const m = L.marker([p.lat, p.lon], { icon: icono('#7c3aed', String(i + 1)) }).addTo(mapa);
          capaRef.current.marcadores.push(m);
        });
      }
      if (rutaRealizada.length >= 2) {
        const linea = L.polyline(rutaRealizada.map((p) => [p.lat, p.lon]), { color: '#0891b2', weight: 4 }).addTo(mapa);
        capaRef.current.lineas.push(linea);
      }
      for (const evento of eventos) {
        if (evento.lat == null || evento.lon == null) continue;
        const m = L.marker([evento.lat, evento.lon], { icon: icono('#7c3aed', '📍') }).addTo(mapa).bindPopup(
          `<strong>${evento.tipoEvento.replaceAll('_', ' ')}</strong>${evento.destino ? `<br/>${evento.destino}` : ''}${evento.movil ? `<br/>Móvil: ${evento.movil}` : ''}<br/>${new Date(evento.timestamp).toLocaleString('es-PY')}${evento.observacion ? `<br/>${evento.observacion}` : ''}`,
        );
        capaRef.current.marcadores.push(m);
      }
      for (const prueba of pruebas) {
        const color = COLOR_NIVEL[prueba.nivel] ?? '#64748b';
        const m = L.marker([prueba.lat, prueba.lon], { icon: icono(color, String(prueba.nivel)) }).addTo(mapa).bindPopup(
          `<strong>Prueba de comunicación</strong><br/>Nivel: ${prueba.nivel}/5<br/>${prueba.distanciaMetros != null ? `Distancia: ${(prueba.distanciaMetros / 1000).toFixed(2)} km<br/>` : ''}${prueba.movil ? `Móvil: ${prueba.movil}<br/>` : ''}${new Date(prueba.creadoEn).toLocaleString('es-PY')}${prueba.observacion ? `<br/>${prueba.observacion}` : ''}`,
        );
        capaRef.current.marcadores.push(m);
      }
    });
    return () => { cancelado = true; };
  }, [cuartel, incidente, rutaPlanificada, rutaEnEdicion, rutaRealizada, eventos, pruebas]);

  return <div ref={contenedorRef} style={{ width: '100%', height: '100%', minHeight: 380, borderRadius: 8, cursor: modoClic !== 'ninguno' ? 'crosshair' : undefined }} />;
}
