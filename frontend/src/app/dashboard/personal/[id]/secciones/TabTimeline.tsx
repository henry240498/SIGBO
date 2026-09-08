'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';
import { MovimientoHistorial } from '../expediente';

export function TabTimeline({ bomberoId }: { bomberoId: string }) {
  const [items, setItems] = useState<MovimientoHistorial[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    apiFetch(`/personal/bomberos/${bomberoId}/historial`)
      .then(async (res) => {
        // Un fallo no puede terminar en setItems([]): "sin movimientos" es una
        // afirmacion sobre el bombero, y un 500 o un 403 no autorizan a hacerla.
        if (!res.ok) {
          setError('No se pudo cargar la línea de tiempo.');
          return;
        }
        setItems(await res.json());
      })
      .catch(() => setError('No se pudo cargar la línea de tiempo.'));
  }, [bomberoId]);

  if (error) return <Aviso tipo="error" texto={error} />;
  if (!items) return <Cargando texto="Cargando la línea de tiempo…" />;
  if (items.length === 0) return <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin movimientos registrados.</p>;

  const ordenados = [...items].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {ordenados.map((m, idx) => (
        <div key={m.id} style={{ display: 'flex', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2563eb', marginTop: 4 }} />
            {idx < ordenados.length - 1 && <div style={{ flex: 1, width: 2, background: 'var(--neutral-fill)' }} />}
          </div>
          <div style={{ paddingBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{m.fecha}</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{m.tipoMovimiento}</div>
            {m.motivo && <div style={{ fontSize: 13 }}>{m.motivo}</div>}
            {m.observacion && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{m.observacion}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Auditoria                                                             */
/* ------------------------------------------------------------------ */
