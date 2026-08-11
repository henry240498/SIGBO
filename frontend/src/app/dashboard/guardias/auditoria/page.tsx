'use client';

import { Fragment, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface LogAuditoria {
  id: string;
  accion: string;
  recurso: string;
  recursoId: string | null;
  fecha: string;
  usuarioId: string | null;
  ip: string | null;
  datosAntes: string | null;
  datosDespues: string | null;
}

const RECURSOS_GUARDIAS = [
  'operaciones.guardias',
  'operaciones.asignacion_guardias',
  'operaciones.grupos_guardia',
  'operaciones.grupos_guardia_miembros',
  'operaciones.pernoctes',
  'operaciones.inspecciones_estacion',
  'operaciones.novedades_guardia',
  'operaciones.requisitos_rol_guardia',
];

export default function AuditoriaGuardiasPage() {
  const [items, setItems] = useState<LogAuditoria[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/seguridad/auditoria?recursoPrefijo=operaciones.&pageSize=200')
      .then(async (res) => {
        if (!res.ok) {
          setError('No tienes permiso para ver la auditoria (se requiere el permiso seguridad:ver_logs).');
          return;
        }
        const body = await res.json();
        setItems((body.items as LogAuditoria[]).filter((i) => RECURSOS_GUARDIAS.includes(i.recurso)));
      })
      .catch(() => setError('No se pudo cargar la auditoria'));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontSize: 16 }}>Auditoria del Modulo Guardias</h2>

      {error && <p style={{ color: '#94a3b8', fontSize: 13 }}>{error}</p>}
      {!error && !items && <p style={{ color: '#94a3b8' }}>Cargando...</p>}
      {!error && items && items.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin registros de auditoria.</p>}

      {!error && items && items.length > 0 && (
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '6px 4px' }}>Fecha</th>
                <th style={{ padding: '6px 4px' }}>Recurso</th>
                <th style={{ padding: '6px 4px' }}>Accion</th>
                <th style={{ padding: '6px 4px' }}>IP</th>
                <th style={{ padding: '6px 4px' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((log) => (
                <Fragment key={log.id}>
                  <tr style={{ borderBottom: '1px solid #1f2937' }}>
                    <td style={{ padding: '6px 4px' }}>{new Date(log.fecha).toLocaleString()}</td>
                    <td style={{ padding: '6px 4px' }}>{log.recurso}</td>
                    <td style={{ padding: '6px 4px' }}>
                      <span className="badge">{log.accion}</span>
                    </td>
                    <td style={{ padding: '6px 4px' }}>{log.ip ?? ''}</td>
                    <td style={{ padding: '6px 4px' }}>
                      <button
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
                      <td colSpan={5} style={{ padding: '6px 4px', background: '#0f172a' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 11 }}>
                          <pre style={{ whiteSpace: 'pre-wrap' }}>
                            Antes: {log.datosAntes ? JSON.stringify(JSON.parse(log.datosAntes), null, 2) : '(nada)'}
                          </pre>
                          <pre style={{ whiteSpace: 'pre-wrap' }}>
                            Despues: {log.datosDespues ? JSON.stringify(JSON.parse(log.datosDespues), null, 2) : '(nada)'}
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
      )}
    </div>
  );
}
