'use client';

import Link from 'next/link';
import { Bombero, campoTexto } from '../expediente';

export function TabRangoCargo({ bombero }: { bombero: Bombero }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {campoTexto('Rango actual', bombero.rango)}
        {campoTexto('Cargo actual', bombero.cargo)}
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted)' }}>
        Los ascensos y designaciones formales se gestionan desde los modulos de Organizacion Institucional.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <Link href={`/dashboard/organizacion/ascensos?bomberoId=${bombero.id}`} className="btn-primary" style={{ textDecoration: 'none' }}>
          Ver ascensos
        </Link>
        <Link
          href={`/dashboard/organizacion/designaciones?bomberoId=${bombero.id}`}
          className="btn-primary"
          style={{ textDecoration: 'none' }}
        >
          Ver designaciones
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Trayectoria / historial institucional                               */
/* ------------------------------------------------------------------ */
