'use client';

import { useEffect, useId, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { Ausencia, EstadoAusencia, cancelarAusencia, cargarAusencias, decidirAusencia, pedirAusencia } from '@/lib/ausencias';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';
import { useEntradaConfirmada } from '@/app/components/InputProvider';

const FONDO: Record<EstadoAusencia, string> = {
  SOLICITADA: 'var(--warn-fill)',
  APROBADA: 'var(--ok-fill)',
  RECHAZADA: 'var(--bad-fill)',
  CANCELADA: 'var(--neutral-fill)',
};
const ETIQUETA: Record<EstadoAusencia, string> = { SOLICITADA: 'Pendiente', APROBADA: 'Aprobada', RECHAZADA: 'Rechazada', CANCELADA: 'Cancelada' };
const NEUTRO: React.CSSProperties = { background: 'var(--neutral-fill)', color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 8, padding: '6px 10px', fontSize: 13, cursor: 'pointer' };

export default function AusenciasPage() {
  const id = useId();
  const pedirTexto = useEntradaConfirmada();
  const [lista, setLista] = useState<Ausencia[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [motivo, setMotivo] = useState('');

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedePedir = permisos.includes('ausencias:solicitar');
  const puedeDecidir = permisos.includes('ausencias:decidir');

  async function cargar() {
    try {
      setLista(await cargarAusencias());
    } catch (err: any) {
      setError(err.message);
    }
  }
  useEffect(() => {
    if (puedePedir) cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function ejecutar(accion: () => Promise<unknown>, ok: string) {
    setError(null);
    setMensaje(null);
    try {
      await accion();
      setMensaje(ok);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function rechazar(a: Ausencia) {
    const m = await pedirTexto({ titulo: 'Rechazar ausencia', mensaje: `${a.bombero}: ${a.desde} al ${a.hasta}`, etiqueta: 'Motivo', confirmar: 'Rechazar', peligro: true, requerida: true });
    if (m) await ejecutar(() => decidirAusencia(a.id, 'RECHAZAR', m), 'Ausencia rechazada');
  }

  if (!puedePedir) return <p style={{ fontSize: 13, color: 'var(--muted)' }}>No tiene permiso para ver ausencias.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 16 }}>Ausencias del personal</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          Una ausencia aprobada marca al bombero como no disponible en la disponibilidad en vivo. Cada uno ve las suyas; quien decide ve todas.
        </p>
      </div>
      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      <form
        className="card"
        style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}
        onSubmit={(e) => {
          e.preventDefault();
          ejecutar(async () => {
            await pedirAusencia({ desde, hasta, motivo });
            setDesde('');
            setHasta('');
            setMotivo('');
          }, 'Ausencia solicitada');
        }}
      >
        <div>
          <label htmlFor={`${id}-d`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Desde</label>
          <input id={`${id}-d`} className="input-field" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} required />
        </div>
        <div>
          <label htmlFor={`${id}-h`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Hasta</label>
          <input id={`${id}-h`} className="input-field" type="date" min={desde} value={hasta} onChange={(e) => setHasta(e.target.value)} required />
        </div>
        <div style={{ flex: '1 1 240px' }}>
          <label htmlFor={`${id}-m`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Motivo</label>
          <input id={`${id}-m`} className="input-field" value={motivo} onChange={(e) => setMotivo(e.target.value)} required minLength={3} maxLength={300} />
        </div>
        <button type="submit" className="btn-primary">Pedir ausencia</button>
      </form>

      {lista === null ? (
        <Cargando texto="Cargando ausencias…" />
      ) : lista.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>No hay ausencias registradas.</p>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th scope="col">Bombero</th>
                <th scope="col">Período</th>
                <th scope="col">Estado</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((a) => (
                <tr key={a.id}>
                  <td>{a.bombero}<div style={{ fontSize: 12, color: 'var(--muted)' }}>{a.motivo}</div></td>
                  <td>{a.desde} al {a.hasta}</td>
                  <td>
                    <span className="badge" style={{ background: FONDO[a.estado] }}>{ETIQUETA[a.estado]}</span>
                    {a.motivoDecision && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{a.motivoDecision}</div>}
                  </td>
                  <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {puedeDecidir && a.estado === 'SOLICITADA' && (
                      <>
                        <button type="button" className="btn-primary" onClick={() => ejecutar(() => decidirAusencia(a.id, 'APROBAR'), 'Ausencia aprobada')}>Aprobar</button>
                        <button type="button" style={NEUTRO} onClick={() => rechazar(a)}>Rechazar</button>
                      </>
                    )}
                    {(a.estado === 'SOLICITADA' || a.estado === 'APROBADA') && (
                      <button type="button" style={NEUTRO} onClick={() => ejecutar(() => cancelarAusencia(a.id), 'Ausencia cancelada')}>Cancelar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
