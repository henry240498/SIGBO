'use client';

import { Fragment, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { formatearJsonSeguro } from '@/lib/json-seguro';
import { Cargando } from '@/app/components/Cargando';

export function TabAuditoria({ bomberoId }: { bomberoId: string }) {
  const [items, setItems] = useState<LogAuditoria[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null);

  useEffect(() => {
    apiFetch(`/seguridad/auditoria?recurso=personal.bomberos&recursoId=${bomberoId}&pageSize=100`)
      .then(async (res) => {
        if (!res.ok) {
          setError('No tienes permiso para ver la auditoria de este registro.');
          return;
        }
        const body = await res.json();
        setItems(body.items);
      })
      .catch(() => setError('No se pudo cargar la auditoria'));
  }, [bomberoId]);

  if (error) return <p style={{ color: 'var(--muted)', fontSize: 13 }}>{error}</p>;
  if (!items) return <Cargando texto="Cargando…" />;
  if (items.length === 0) return <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin registros de auditoría.</p>;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
            <th scope="col" style={{ padding: '6px 4px' }}>Fecha</th>
            <th scope="col" style={{ padding: '6px 4px' }}>Acción</th>
            <th scope="col" style={{ padding: '6px 4px' }}>IP</th>
            <th scope="col" style={{ padding: '6px 4px' }}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((log) => (
            <Fragment key={log.id}>
              <tr style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>{new Date(log.fecha).toLocaleString()}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge">{log.accion}</span>
                </td>
                <td style={{ padding: '6px 4px' }}>{log.ip ?? ''}</td>
                <td style={{ padding: '6px 4px' }}>
                  <button type="button"
                    className="btn-primary"
                    style={{ padding: '4px 8px', fontSize: 12 }}
                    onClick={() => setExpandido(expandido === log.id ? null : log.id)}
                  >
                    {expandido === log.id ? 'Ocultar' : 'Ver detalle'}
                  </button>
                </td>
              </tr>
              {expandido === log.id && (
                <tr>
                  <td colSpan={4} style={{ padding: '6px 4px', background: 'var(--surface-soft)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 11 }}>
                      <pre style={{ whiteSpace: 'pre-wrap' }}>
                        Antes: {formatearJsonSeguro(log.datosAntes)}
                      </pre>
                      <pre style={{ whiteSpace: 'pre-wrap' }}>
                        Despues: {formatearJsonSeguro(log.datosDespues)}
                      </pre>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}


interface LogAuditoria {
  id: string;
  accion: string;
  fecha: string;
  usuarioId: string | null;
  ip: string | null;
  datosAntes: string | null;
  datosDespues: string | null;
}
