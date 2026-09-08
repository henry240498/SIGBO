'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { EquipamientoDeBomberoItem, cargarEquipamientoDeBombero } from '@/lib/deposito';
import { Aviso } from '@/app/components/Aviso';
import { formatearFechaHora } from '../expediente';

export function TabEquipamientoDeposito({ bomberoId }: { bomberoId: string }) {
  const [items, setItems] = useState<EquipamientoDeBomberoItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarEquipamientoDeBombero(bomberoId)
      .then(setItems)
      .catch((err) => setError(err.message));
  }, [bomberoId]);

  return (
    <div className="card">
      <h2 style={{ fontSize: 14, marginBottom: 10 }}>
        Deposito — <Link href="/dashboard/deposito/movimientos" style={{ color: 'var(--signal)', fontSize: 12 }}>ver movimientos ↗</Link>
      </h2>
      {error && <Aviso tipo="error" texto={error} fontSize={13} />}
      {items && items.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin elementos del módulo Depósito a su nombre.</p>}
      {items && items.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Elemento</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Cantidad</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Actualizado</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>
                  {it.codigo ? `${it.codigo} - ${it.nombre}` : it.nombre}
                  <span className="badge" style={{ marginLeft: 6, background: 'var(--neutral-fill)' }}>{it.tipoElemento}</span>
                </td>
                <td style={{ padding: '6px 4px' }}>{it.cantidad ?? '-'}</td>
                <td style={{ padding: '6px 4px' }}>{formatearFechaHora(it.actualizadoEn)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Vehiculos autorizados                                                */
/* ------------------------------------------------------------------ */
