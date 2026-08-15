'use client';

import { useEffect, useState } from 'react';
import { ConversacionIa, EjecucionHerramientaIa, MensajeIa, cargarConversacion, cargarEjecucionesDeConversacion, cargarTodasLasConversaciones } from '@/lib/ia';

function formatearFechaHora(iso: string) {
  return new Date(iso).toLocaleString('es-PY');
}

function DetalleConversacion({ id, onCerrar }: { id: string; onCerrar: () => void }) {
  const [datos, setDatos] = useState<{ conversacion: ConversacionIa; mensajes: MensajeIa[] } | null>(null);
  const [ejecuciones, setEjecuciones] = useState<EjecucionHerramientaIa[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([cargarConversacion(id), cargarEjecucionesDeConversacion(id)])
      .then(([conv, ejec]) => {
        setDatos(conv);
        setEjecuciones(ejec);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div className="card" style={{ width: 640, maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 15 }}>Conversación</h3>
          <button className="btn-primary" style={{ background: '#475569', padding: '4px 10px' }} onClick={onCerrar}>Cerrar</button>
        </div>
        {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}
        {!datos && !error && <p style={{ color: '#94a3b8', fontSize: 13 }}>Cargando...</p>}
        {datos && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {datos.mensajes.map((m) => (
              <div key={m.id} style={{ fontSize: 13 }}>
                <span className="badge" style={{ background: m.rol === 'USUARIO' ? '#2563eb' : '#334155', marginRight: 6 }}>{m.rol}</span>
                <span style={{ color: m.resultado === 'ERROR' ? '#f87171' : '#e2e8f0' }}>{m.contenido}</span>
                {m.duracionMs != null && <span style={{ color: '#64748b', fontSize: 11 }}> ({m.duracionMs}ms)</span>}
              </div>
            ))}
          </div>
        )}
        {ejecuciones && ejecuciones.length > 0 && (
          <div style={{ borderTop: '1px solid #334155', paddingTop: 10 }}>
            <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Herramientas usadas</p>
            {ejecuciones.map((e) => (
              <div key={e.id} style={{ fontSize: 12, padding: '4px 0', color: '#94a3b8' }}>
                <span className="badge" style={{ background: e.resultado === 'PERMITIDO' ? '#166534' : e.resultado === 'DENEGADO' ? '#7f1d1d' : '#451a03', marginRight: 6 }}>{e.resultado}</span>
                {e.herramienta} {e.datosConsultadosResumen ? `— ${e.datosConsultadosResumen}` : ''}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConversacionesIaPage() {
  const [conversaciones, setConversaciones] = useState<ConversacionIa[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detalleId, setDetalleId] = useState<string | null>(null);

  useEffect(() => {
    cargarTodasLasConversaciones()
      .then(setConversaciones)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontSize: 16 }}>Conversaciones ({conversaciones?.length ?? 0})</h2>
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {conversaciones && conversaciones.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin conversaciones registradas.</p>}
      {conversaciones && conversaciones.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Título</th>
              <th style={{ padding: '6px 4px' }}>Usuario</th>
              <th style={{ padding: '6px 4px' }}>Última actividad</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {conversaciones.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #1f2937', cursor: 'pointer' }} onClick={() => setDetalleId(c.id)}>
                <td style={{ padding: '6px 4px', color: '#60a5fa' }}>{c.titulo ?? '(sin título)'}</td>
                <td style={{ padding: '6px 4px', fontSize: 11, color: '#94a3b8' }}>{c.usuarioId.slice(0, 8)}</td>
                <td style={{ padding: '6px 4px' }}>{formatearFechaHora(c.ultimaActividadEn)}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={{ background: c.estado === 'ACTIVA' ? '#166534' : '#334155' }}>{c.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {detalleId && <DetalleConversacion id={detalleId} onCerrar={() => setDetalleId(null)} />}
    </div>
  );
}
