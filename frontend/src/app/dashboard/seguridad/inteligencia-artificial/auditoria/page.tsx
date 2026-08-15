'use client';

import { useEffect, useState } from 'react';
import { RegistroAuditoriaIa, cargarAuditoriaIa } from '@/lib/ia';

function formatearFechaHora(iso: string) {
  return new Date(iso).toLocaleString('es-PY');
}

export default function AuditoriaIaPage() {
  const [registros, setRegistros] = useState<RegistroAuditoriaIa[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  async function cargar() {
    try {
      const res = await cargarAuditoriaIa({ desde: desde || undefined, hasta: hasta || undefined });
      setRegistros(res.items);
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontSize: 16 }}>Auditoría administrativa de Inteligencia Artificial</h2>
      <p style={{ fontSize: 12, color: '#94a3b8' }}>
        Cambios de configuración, activaciones/desactivaciones y decisiones sobre propuestas de mejora. La auditoría de cada conversación (preguntas, respuestas, herramientas usadas) está en la pestaña Conversaciones.
      </p>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Desde</label>
          <input className="input-field" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Hasta</label>
          <input className="input-field" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={cargar}>Filtrar</button>
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {registros && registros.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin eventos registrados en este período.</p>}
      {registros && registros.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Fecha</th>
              <th style={{ padding: '6px 4px' }}>Acción</th>
              <th style={{ padding: '6px 4px' }}>Recurso</th>
              <th style={{ padding: '6px 4px' }}>IP</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>{formatearFechaHora(r.fecha)}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={{ background: '#334155' }}>{r.accion}</span>
                </td>
                <td style={{ padding: '6px 4px', color: '#94a3b8' }}>{r.recurso}{r.recursoId ? ` #${r.recursoId.slice(0, 8)}` : ''}</td>
                <td style={{ padding: '6px 4px', color: '#94a3b8' }}>{r.ip ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
