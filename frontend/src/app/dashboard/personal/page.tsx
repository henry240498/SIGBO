'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface Bombero {
  id: string;
  nombre: string;
  apellido: string;
  rango: string;
  numeroBombero: string;
  estado: string;
}

export default function PersonalPage() {
  const [bomberos, setBomberos] = useState<Bombero[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/personal/bomberos')
      .then(async (res) => {
        if (!res.ok) throw new Error('No se pudo cargar el listado de bomberos');
        setBomberos(await res.json());
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <section className="card">
      <h2 style={{ fontSize: 16, marginBottom: 12 }}>Personal - Bomberos</h2>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      {bomberos && bomberos.length === 0 && (
        <p style={{ color: '#94a3b8', fontSize: 13 }}>
          Todavia no hay bomberos registrados. Usa la API (POST /personal/bomberos) para crear el
          primer registro.
        </p>
      )}

      {bomberos && bomberos.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Nro.</th>
              <th style={{ padding: '6px 4px' }}>Nombre</th>
              <th style={{ padding: '6px 4px' }}>Rango</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {bomberos.map((b) => (
              <tr key={b.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>{b.numeroBombero}</td>
                <td style={{ padding: '6px 4px' }}>
                  {b.nombre} {b.apellido}
                </td>
                <td style={{ padding: '6px 4px' }}>{b.rango}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge">{b.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
