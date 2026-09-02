'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Cargando } from '@/app/components/Cargando';
import { MovimientoHistorial } from '../expediente';

export function TabTimeline({ bomberoId }: { bomberoId: string }) {
  const [items, setItems] = useState<MovimientoHistorial[] | null>(null);

  useEffect(() => {
    apiFetch(`/personal/bomberos/${bomberoId}/historial`)
      .then(async (res) => (res.ok ? setItems(await res.json()) : setItems([])))
      .catch(() => setItems([]));
  }, [bomberoId]);

  if (!items) return <Cargando texto="Cargando…" />;
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
