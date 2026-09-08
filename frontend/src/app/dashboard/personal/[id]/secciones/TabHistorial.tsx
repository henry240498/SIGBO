'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Aviso } from '@/app/components/Aviso';
import { MovimientoHistorial } from '../expediente';

export function TabHistorial({ bomberoId, puedeEditar }: { bomberoId: string; puedeEditar: boolean }) {
  const [items, setItems] = useState<MovimientoHistorial[] | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tipoMovimiento, setTipoMovimiento] = useState<'RECONOCIMIENTO' | 'SANCION'>('RECONOCIMIENTO');
  const [fecha, setFecha] = useState('');
  const [motivo, setMotivo] = useState('');
  const [observacion, setObservacion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    const res = await apiFetch(`/personal/bomberos/${bomberoId}/historial`);
    if (res.ok) setItems(await res.json());
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bomberoId]);

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      const res = await apiFetch(`/personal/bomberos/${bomberoId}/historial`, {
        method: 'POST',
        body: JSON.stringify({ tipoMovimiento, fecha, motivo: motivo || undefined, observacion: observacion || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'No se pudo registrar');
      }
      setMostrarForm(false);
      setFecha('');
      setMotivo('');
      setObservacion('');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {puedeEditar && (
        <button type="button" className="btn-primary" style={{ alignSelf: 'flex-end' }} onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? 'Cancelar' : 'Registrar reconocimiento / sancion'}
        </button>
      )}
      {mostrarForm && (
        <form className="card" onSubmit={registrar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {error && <Aviso tipo="error" texto={error} />}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="tipo" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo</label>
              <select id="tipo"
                className="input-field"
                value={tipoMovimiento}
                onChange={(e) => setTipoMovimiento(e.target.value as 'RECONOCIMIENTO' | 'SANCION')}
              >
                <option value="RECONOCIMIENTO">RECONOCIMIENTO</option>
                <option value="SANCION">SANCION</option>
              </select>
            </div>
            <div>
              <label htmlFor="fecha" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha</label>
              <input id="fecha" className="input-field" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </div>
          </div>
          <div>
            <label htmlFor="motivo" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Motivo</label>
            <input id="motivo" className="input-field" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          </div>
          <div>
            <label htmlFor="observacion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observación</label>
            <input id="observacion" className="input-field" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Registrar'}
          </button>
        </form>
      )}

      {items && items.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin movimientos registrados.</p>}
      {items && items.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Fecha</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Tipo</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Motivo</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Observación</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>{m.fecha}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge">{m.tipoMovimiento}</span>
                </td>
                <td style={{ padding: '6px 4px' }}>{m.motivo ?? ''}</td>
                <td style={{ padding: '6px 4px' }}>{m.observacion ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Especialidades                                                       */
/* ------------------------------------------------------------------ */
