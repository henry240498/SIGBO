'use client';

import { useEffect, useState } from 'react';
import { RegistroAuditoria, cargarAuditoriaGeneral } from '@/lib/documentos';
import { Aviso } from '@/app/components/Aviso';

function formatearFechaHora(iso: string) {
  return new Date(iso).toLocaleString('es-PY');
}

export default function AuditoriaDocumentosPage() {
  const [registros, setRegistros] = useState<RegistroAuditoria[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  async function cargar() {
    try {
      const res = await cargarAuditoriaGeneral({ desde: desde || undefined, hasta: hasta || undefined });
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
      <h2 style={{ fontSize: 16 }}>Auditoria del modulo Documentos</h2>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <div>
          <label htmlFor="desde" style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Desde</label>
          <input id="desde" className="input-field" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div>
          <label htmlFor="hasta" style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Hasta</label>
          <input id="hasta" className="input-field" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        <button type="button" className="btn-primary" onClick={cargar}>Filtrar</button>
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {registros && registros.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin eventos registrados en este periodo.</p>}
      {registros && registros.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Fecha</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Accion</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Recurso</th>
              <th scope="col" style={{ padding: '6px 4px' }}>IP</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>{formatearFechaHora(r.fecha)}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={{ background: 'var(--neutral-fill)' }}>{r.accion}</span>
                </td>
                <td style={{ padding: '6px 4px', color: 'var(--muted)' }}>{r.recurso}{r.recursoId ? ` #${r.recursoId.slice(0, 8)}` : ''}</td>
                <td style={{ padding: '6px 4px', color: 'var(--muted)' }}>{r.ip ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
