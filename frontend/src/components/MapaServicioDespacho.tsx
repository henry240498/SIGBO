'use client';

import { useEffect, useRef } from 'react';
import type { LayerGroup, Map as LeafletMap } from 'leaflet';
import type { MapaServicioOperativo } from '@/lib/despacho';

const COLOR_ESTADO: Record<string, string> = {
  DESPACHADO: '#d9822b',
  EN_SERVICIO: '#c0392b',
  REGRESANDO: '#2f6fdb',
};

/** Mapa de un servicio. Los datos y la autorización los resuelve el backend. */
export default function MapaServicioDespacho({ datos }: { datos: MapaServicioOperativo }) {
  const urlTeselas = datos.mapaBase.urlTeselas?.trim();
  const atribucion = datos.mapaBase.atribucion;
  const contenedor = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<LeafletMap | null>(null);
  const capaRef = useRef<LayerGroup | null>(null);
  const encuadrado = useRef(false);

  useEffect(() => {
    let cancelado = false;
    import('leaflet').then((L) => {
      if (cancelado || !contenedor.current || mapaRef.current) return;
      const mapa = L.map(contenedor.current).setView([-25.3, -57.6], 7);
      // Las coordenadas de un servicio pueden ser confidenciales. Solo se
      // envían teselas a un servidor cartográfico que controle la institución.
      if (urlTeselas) {
        L.tileLayer(urlTeselas, {
          attribution: atribucion,
          maxZoom: 19,
        }).addTo(mapa);
      }
      capaRef.current = L.layerGroup().addTo(mapa);
      mapaRef.current = mapa;
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
        const puntos: Array<{ lat: number; lon: number }> = [];
        const agregar = (latitud: unknown, longitud: unknown, etiqueta: string, color: string) => {
          const lat = Number(latitud);
          const lon = Number(longitud);
          if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return;
          puntos.push({ lat, lon });
          L.circleMarker([lat, lon], {
            radius: 12,
            color: '#ffffff',
            weight: 3,
            fillColor: color,
            fillOpacity: 0.96,
          }).bindTooltip(etiqueta).addTo(capa);
        };

        const ubicacion = datos.servicio.ubicacion;
        if (ubicacion) {
          agregar(ubicacion.latitud, ubicacion.longitud,
            `${datos.servicio.numeroServicio ?? 'Servicio'} · Incidente`, '#b42318');
        }
        for (const movil of datos.moviles) {
          if (!movil.posicion) continue;
          const actualizado = new Date(movil.posicion.registradoEn).toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' });
          agregar(movil.posicion.latitud, movil.posicion.longitud,
            `${movil.movil} · ${movil.estado.replaceAll('_', ' ')} · ${actualizado}`,
            COLOR_ESTADO[movil.estado] ?? '#475569');
        }
        if (!encuadrado.current && puntos.length) {
          mapa.fitBounds(L.latLngBounds(puntos.map((p) => [p.lat, p.lon] as [number, number])), {
            padding: [36, 36],
            maxZoom: 16,
          });
          encuadrado.current = true;
        }
      });
    };
    dibujar();
    const espera = setTimeout(dibujar, 500);
    return () => {
      cancelado = true;
      clearTimeout(espera);
    };
  }, [datos]);

  return <div style={{ display: 'grid', gap: 6 }}>
    {!urlTeselas && <small style={{ color: 'var(--muted)' }}>Servidor cartográfico institucional no configurado; se muestran posiciones relativas para no enviar ubicaciones del servicio a terceros.</small>}
    <div ref={contenedor} role="img" aria-label="Mapa operativo del servicio" style={{ height: 340, borderRadius: 10, border: '1px solid var(--line)', background: '#eef2f6' }} />
  </div>;
}
