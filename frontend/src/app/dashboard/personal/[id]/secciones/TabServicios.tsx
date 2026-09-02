'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { HistorialAsignacion, cargarHistorialGuardiasPersonal } from '@/lib/guardias';

export function TabServicios({ bomberoId }: { bomberoId: string }) {
  const [guardias, setGuardias] = useState<HistorialAsignacion[] | null>(null);
  const [servicios, setServicios] = useState<any[] | null>(null);

  useEffect(() => {
    cargarHistorialGuardiasPersonal(bomberoId).then(setGuardias).catch(() => setGuardias([]));
    apiFetch(`/personal/bomberos/${bomberoId}/servicios`)
      .then(async (res) => (res.ok ? setServicios(await res.json()) : setServicios([])))
      .catch(() => setServicios([]));
  }, [bomberoId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="card">
        <h3 style={{ fontSize: 14, marginBottom: 8 }}>Guardias ({guardias?.length ?? 0})</h3>
        {guardias && guardias.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin guardias registradas.</p>}
        {guardias && guardias.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                <th scope="col" style={{ padding: '6px 4px' }}>Fecha</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Turno</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Tipo</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Rol</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Participación</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {guardias.map((g) => (
                <tr key={g.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                  <td style={{ padding: '6px 4px' }}>
                    <Link href={`/dashboard/guardias/${g.guardia.id}`} style={{ color: 'var(--signal)', textDecoration: 'none' }}>
                      {g.guardia.fecha}
                    </Link>
                  </td>
                  <td style={{ padding: '6px 4px' }}>{g.guardia.turno}</td>
                  <td style={{ padding: '6px 4px' }}>{g.guardia.tipo}</td>
                  <td style={{ padding: '6px 4px' }}>{g.rol ?? '—'}</td>
                  <td style={{ padding: '6px 4px' }}>{g.tipoParticipacion}</td>
                  <td style={{ padding: '6px 4px' }}><span className="badge">{g.guardia.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="card">
        <h3 style={{ fontSize: 14, marginBottom: 8 }}>Servicios</h3>
        {servicios && servicios.length === 0 && (
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>
            Sin servicios registrados. El modulo de Servicios todavia no esta implementado.
          </p>
        )}
        {servicios && servicios.length > 0 && <pre style={{ fontSize: 12 }}>{JSON.stringify(servicios, null, 2)}</pre>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Equipamiento                                                         */
/* ------------------------------------------------------------------ */
