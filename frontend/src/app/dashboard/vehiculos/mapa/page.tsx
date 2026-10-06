'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { PosicionMovil, cargarPosiciones } from '@/lib/flota';
import { Aviso } from '@/app/components/Aviso';

const MapaFlota = dynamic(() => import('@/components/MapaFlota'), {
  ssr: false,
  loading: () => <p style={{ color: 'var(--muted)', fontSize: 13 }}>Cargando mapa…</p>,
});

const REFRESCO_MS = 10000;

const LEYENDA: Array<{ estado: string; texto: string; fondo: string }> = [
  { estado: 'EN_CUARTEL', texto: 'En cuartel', fondo: 'var(--ok-fill)' },
  { estado: 'DESPACHADO', texto: 'Despachado', fondo: 'var(--warn-fill)' },
  { estado: 'EN_SERVICIO', texto: 'En servicio', fondo: 'var(--bad-fill)' },
  { estado: 'REGRESANDO', texto: 'Regresando', fondo: 'var(--info-fill)' },
];

export default function MapaFlotaPage() {
  const [posiciones, setPosiciones] = useState<PosicionMovil[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    try {
      setPosiciones(await cargarPosiciones());
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    const timer = setInterval(cargar, REFRESCO_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 16 }}>Mapa de flota</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          Última posición reportada por cada móvil desde la aplicación móvil. Se actualiza cada {REFRESCO_MS / 1000} segundos.
        </p>
      </div>
      {error && <Aviso tipo="error" texto={error} />}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {LEYENDA.map((l) => (
          <span key={l.estado} className="badge" style={{ background: l.fondo }}>
            {l.texto}: {posiciones?.filter((p) => p.estadoOperativo === l.estado).length ?? 0}
          </span>
        ))}
      </div>
      {posiciones !== null && posiciones.length === 0 && (
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          Ningún móvil reportó su posición todavía. Aparecerán aquí cuando la aplicación móvil envíe su ubicación.
        </p>
      )}
      <MapaFlota posiciones={posiciones ?? []} />
    </div>
  );
}
