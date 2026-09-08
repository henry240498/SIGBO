'use client';

import { useEffect, useState } from 'react';
import {
  PropuestaMejoraIa,
  aprobarPropuestaMejora,
  cargarPropuestasMejora,
  crearPropuestaMejora,
  enviarPropuestaARevision,
  publicarPropuestaMejora,
  rechazarPropuestaMejora,
} from '@/lib/ia';
import { Aviso } from '@/app/components/Aviso';

function formatearFechaHora(iso: string) {
  return new Date(iso).toLocaleString('es-PY');
}

function colorEstado(estado: string) {
  switch (estado) {
    case 'PROPUESTA':
    case 'REVISION':
      return 'var(--warn-fill)';
    case 'APROBADO':
    case 'PUBLICADO':
      return 'var(--ok-fill)';
    case 'RECHAZADO':
      return 'var(--bad-fill)';
    default:
      return 'var(--neutral-fill)';
  }
}

export default function PropuestasMejoraIaPage() {
  const [propuestas, setPropuestas] = useState<PropuestaMejoraIa[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [problemaDetectado, setProblemaDetectado] = useState('');
  const [propuestaTexto, setPropuestaTexto] = useState('');
  const [motivoDecision, setMotivoDecision] = useState<Record<string, string>>({});

  async function cargar() {
    try {
      setPropuestas(await cargarPropuestasMejora());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await crearPropuestaMejora(problemaDetectado, propuestaTexto);
      setMensaje('Propuesta creada.');
      setProblemaDetectado('');
      setPropuestaTexto('');
      setMostrarForm(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function accion(fn: (id: string, motivo?: string) => Promise<PropuestaMejoraIa>, id: string) {
    setError(null);
    setMensaje(null);
    try {
      await fn(id, motivoDecision[id]);
      setMensaje('Propuesta actualizada.');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Propuestas de mejora ({propuestas?.length ?? 0})</h2>
        <button type="button" className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>{mostrarForm ? 'Cancelar' : '+ Nueva propuesta'}</button>
      </div>

      <p style={{ fontSize: 12, color: 'var(--muted)' }}>
        Flujo: BORRADOR → PROPUESTA → REVISIÓN → APROBADO/RECHAZADO → PUBLICADO. Publicar una propuesta no cambia la configuración automáticamente — un administrador debe trasladar el cambio desde la pestaña Configuración.
      </p>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {mostrarForm && (
        <form onSubmit={crear} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label htmlFor="problema-detectado" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Problema detectado</label>
            <textarea id="problema-detectado" className="input-field" rows={2} value={problemaDetectado} onChange={(e) => setProblemaDetectado(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="propuesta" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Propuesta</label>
            <textarea id="propuesta" className="input-field" rows={3} value={propuestaTexto} onChange={(e) => setPropuestaTexto(e.target.value)} required />
          </div>
          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>{guardando ? 'Guardando...' : 'Crear propuesta'}</button>
        </form>
      )}

      {propuestas && propuestas.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin propuestas registradas.</p>}
      {propuestas?.map((p) => (
        <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="badge" style={{ background: colorEstado(p.estado), marginRight: 8 }}>{p.estado}</span>
              <span className="badge" style={{ background: 'var(--neutral-fill)' }}>{p.origen}</span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{formatearFechaHora(p.creadoEn)}</span>
          </div>
          <div>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>Problema detectado</p>
            <p style={{ fontSize: 13 }}>{p.problemaDetectado}</p>
          </div>
          <div>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>Propuesta</p>
            <p style={{ fontSize: 13 }}>{p.propuestaTexto}</p>
          </div>
          {p.motivoDecision && (
            <div>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>Motivo de la decisión</p>
              <p style={{ fontSize: 13 }}>{p.motivoDecision}</p>
            </div>
          )}

          {(p.estado === 'PROPUESTA' || p.estado === 'REVISION') && (
            <input
              className="input-field"
              placeholder="Motivo de la decisión (opcional)"
              value={motivoDecision[p.id] ?? ''}
              onChange={(e) => setMotivoDecision({ ...motivoDecision, [p.id]: e.target.value })}
            />
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            {p.estado === 'PROPUESTA' && (
              <button type="button" className="btn-primary" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => accion(enviarPropuestaARevision, p.id)}>Enviar a revisión</button>
            )}
            {p.estado === 'REVISION' && (
              <>
                <button type="button" className="btn-primary" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => accion(aprobarPropuestaMejora, p.id)}>Aprobar</button>
                <button type="button" className="btn-primary" style={{ padding: '5px 10px', fontSize: 12, background: '#7f1d1d' }} onClick={() => accion(rechazarPropuestaMejora, p.id)}>Rechazar</button>
              </>
            )}
            {p.estado === 'APROBADO' && (
              <button type="button" className="btn-primary" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => accion(publicarPropuestaMejora, p.id)}>Publicar</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
