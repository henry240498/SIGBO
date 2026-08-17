'use client';

import { useEffect, useMemo, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import {
  ConversacionIa,
  ConversacionIaAdmin,
  EjecucionHerramientaIa,
  MensajeIa,
  cargarConversacion,
  cargarEjecucionesDeConversacion,
  cargarTodasLasConversaciones,
  eliminarConversacionIa,
} from '@/lib/ia';

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
  const [conversaciones, setConversaciones] = useState<ConversacionIaAdmin[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [detalleId, setDetalleId] = useState<string | null>(null);
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set());
  const [eliminando, setEliminando] = useState(false);

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeEliminar = permisos.includes('inteligencia:eliminar_conversaciones');

  const todasSeleccionadas = useMemo(
    () => !!conversaciones && conversaciones.length > 0 && conversaciones.every((c) => seleccionadas.has(c.id)),
    [conversaciones, seleccionadas],
  );

  async function cargar() {
    try {
      setConversaciones(await cargarTodasLasConversaciones());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function alternarSeleccion(id: string) {
    setSeleccionadas((prev) => {
      const copia = new Set(prev);
      if (copia.has(id)) copia.delete(id);
      else copia.add(id);
      return copia;
    });
  }

  function alternarTodas() {
    if (!conversaciones) return;
    setSeleccionadas(todasSeleccionadas ? new Set() : new Set(conversaciones.map((c) => c.id)));
  }

  async function eliminarSeleccionadas() {
    if (seleccionadas.size === 0) return;
    if (!window.confirm(`¿Eliminar ${seleccionadas.size} conversación(es)? Esta acción no se puede deshacer.`)) return;
    setError(null);
    setMensaje(null);
    setEliminando(true);
    try {
      for (const id of seleccionadas) {
        await eliminarConversacionIa(id);
      }
      setMensaje(`${seleccionadas.size} conversación(es) eliminada(s).`);
      setSeleccionadas(new Set());
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEliminando(false);
    }
  }

  async function eliminarUna(id: string) {
    if (!window.confirm('¿Eliminar esta conversación? Esta acción no se puede deshacer.')) return;
    setError(null);
    setMensaje(null);
    try {
      await eliminarConversacionIa(id);
      setMensaje('Conversación eliminada.');
      setSeleccionadas((prev) => {
        const copia = new Set(prev);
        copia.delete(id);
        return copia;
      });
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Conversaciones ({conversaciones?.length ?? 0})</h2>
        {puedeEliminar && seleccionadas.size > 0 && (
          <button className="btn-primary" style={{ background: '#7f1d1d' }} disabled={eliminando} onClick={eliminarSeleccionadas}>
            {eliminando ? 'Eliminando...' : `Eliminar seleccionadas (${seleccionadas.size})`}
          </button>
        )}
      </div>
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}
      {conversaciones && conversaciones.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin conversaciones registradas.</p>}
      {conversaciones && conversaciones.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              {puedeEliminar && (
                <th style={{ padding: '6px 4px', width: 28 }}>
                  <input type="checkbox" checked={todasSeleccionadas} onChange={alternarTodas} />
                </th>
              )}
              <th style={{ padding: '6px 4px' }}>Título</th>
              <th style={{ padding: '6px 4px' }}>Usuario</th>
              <th style={{ padding: '6px 4px' }}>Última actividad</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
              {puedeEliminar && <th style={{ padding: '6px 4px' }}></th>}
            </tr>
          </thead>
          <tbody>
            {conversaciones.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #1f2937' }}>
                {puedeEliminar && (
                  <td style={{ padding: '6px 4px' }} onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={seleccionadas.has(c.id)} onChange={() => alternarSeleccion(c.id)} />
                  </td>
                )}
                <td style={{ padding: '6px 4px', color: '#60a5fa', cursor: 'pointer' }} onClick={() => setDetalleId(c.id)}>
                  {c.titulo ?? '(sin título)'}
                </td>
                <td style={{ padding: '6px 4px' }}>{c.usuarioUsername ?? c.usuarioEmail ?? c.usuarioId.slice(0, 8)}</td>
                <td style={{ padding: '6px 4px' }}>{formatearFechaHora(c.ultimaActividadEn)}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={{ background: c.estado === 'ACTIVA' ? '#166534' : '#334155' }}>{c.estado}</span>
                </td>
                {puedeEliminar && (
                  <td style={{ padding: '6px 4px' }}>
                    <button className="btn-primary" style={{ padding: '4px 8px', fontSize: 11, background: '#7f1d1d' }} onClick={() => eliminarUna(c.id)}>
                      Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {detalleId && <DetalleConversacion id={detalleId} onCerrar={() => setDetalleId(null)} />}
    </div>
  );
}
