'use client';

import { useEffect, useId, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import {
  EstadoReserva,
  Instalacion,
  Reserva,
  cancelarReserva,
  cargarInstalaciones,
  cargarReservas,
  crearInstalacion,
  decidirReserva,
  solicitarReserva,
} from '@/lib/reservas';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';
import { useEntradaConfirmada } from '@/app/components/InputProvider';

const FONDO: Record<EstadoReserva, string> = {
  SOLICITADA: 'var(--warn-fill)',
  APROBADA: 'var(--ok-fill)',
  RECHAZADA: 'var(--bad-fill)',
  CANCELADA: 'var(--neutral-fill)',
};
const ETIQUETA: Record<EstadoReserva, string> = {
  SOLICITADA: 'Pendiente de decisión',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  CANCELADA: 'Cancelada',
};

const BOTON_NEUTRO: React.CSSProperties = {
  background: 'var(--neutral-fill)',
  color: 'var(--ink)',
  border: '1px solid var(--line)',
  borderRadius: 8,
  padding: '6px 10px',
  fontSize: 13,
  cursor: 'pointer',
};

/** Valor de un <input type="datetime-local"> -> instante ISO (la hora se interpreta como local). */
const aIso = (local: string) => new Date(local).toISOString();

export default function ReservasPage() {
  const id = useId();
  const pedirTexto = useEntradaConfirmada();
  const [instalaciones, setInstalaciones] = useState<Instalacion[] | null>(null);
  const [reservas, setReservas] = useState<Reserva[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [instalacionId, setInstalacionId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [solicitante, setSolicitante] = useState('');
  const [contacto, setContacto] = useState('');
  const [personas, setPersonas] = useState('');
  const [inicio, setInicio] = useState('');
  const [fin, setFin] = useState('');
  const [nuevaInst, setNuevaInst] = useState('');
  const [nuevaCap, setNuevaCap] = useState('');

  const sesion = obtenerSesion();
  const permisos = sesion?.usuario.permisos ?? [];
  const puedeSolicitar = permisos.includes('reservas:solicitar');
  const puedeDecidir = permisos.includes('reservas:decidir');
  const miId = sesion?.usuario.id;

  async function cargar() {
    try {
      const [i, r] = await Promise.all([cargarInstalaciones(), cargarReservas()]);
      setInstalaciones(i);
      setReservas(r);
      setInstalacionId((actual) => actual || i[0]?.id || '');
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
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

  async function solicitar(e: React.FormEvent) {
    e.preventDefault();
    await ejecutar(async () => {
      const r = await solicitarReserva({
        instalacionId,
        titulo,
        solicitanteNombre: solicitante,
        contacto: contacto || undefined,
        personas: personas ? Number(personas) : undefined,
        inicio: aIso(inicio),
        fin: aIso(fin),
      });
      setTitulo('');
      setContacto('');
      setPersonas('');
      setInicio('');
      setFin('');
      if (r.conflictoConAprobada) setError('Atención: ese horario se superpone con una reserva ya aprobada. Quedó pendiente de decisión.');
    }, 'Solicitud enviada');
  }

  async function rechazar(r: Reserva) {
    const motivo = await pedirTexto({ titulo: 'Rechazar reserva', mensaje: `«${r.titulo}»`, etiqueta: 'Motivo', confirmar: 'Rechazar', peligro: true, requerida: true });
    if (motivo) await ejecutar(() => decidirReserva(r.id, 'RECHAZAR', motivo), 'Reserva rechazada');
  }

  async function cancelar(r: Reserva) {
    const motivo = await pedirTexto({ titulo: 'Cancelar reserva', mensaje: `«${r.titulo}»`, etiqueta: 'Motivo (opcional)', confirmar: 'Cancelar reserva', peligro: true, requerida: false });
    if (motivo !== null) await ejecutar(() => cancelarReserva(r.id, motivo || undefined), 'Reserva cancelada');
  }

  const nombreDe = (iid: string) => instalaciones?.find((i) => i.id === iid)?.nombre ?? '?';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 16 }}>Reservas de instalaciones</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          Salón, patio de simulacros y demás espacios. Una solicitud queda pendiente hasta que quien decide la aprueba; no se aprueban dos reservas que se pisan.
        </p>
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {puedeSolicitar && (
        <form className="card" onSubmit={solicitar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <strong style={{ fontSize: 14 }}>Nueva solicitud</strong>
          {instalaciones !== null && instalaciones.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
              Todavía no hay instalaciones cargadas{puedeDecidir ? ': agregue la primera abajo.' : '. Pida a quien administra las reservas que las cargue.'}
            </p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            <div>
              <label htmlFor={`${id}-inst`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Instalación</label>
              <select id={`${id}-inst`} className="input-field" value={instalacionId} onChange={(e) => setInstalacionId(e.target.value)} required>
                {(instalaciones ?? []).map((i) => (
                  <option key={i.id} value={i.id}>{i.nombre}{i.capacidad ? ` (hasta ${i.capacidad})` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`${id}-tit`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Para qué</label>
              <input id={`${id}-tit`} className="input-field" value={titulo} onChange={(e) => setTitulo(e.target.value)} required minLength={3} maxLength={150} />
            </div>
            <div>
              <label htmlFor={`${id}-sol`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Quién la pide</label>
              <input id={`${id}-sol`} className="input-field" value={solicitante} onChange={(e) => setSolicitante(e.target.value)} required minLength={2} maxLength={150} />
            </div>
            <div>
              <label htmlFor={`${id}-con`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Contacto</label>
              <input id={`${id}-con`} className="input-field" value={contacto} onChange={(e) => setContacto(e.target.value)} maxLength={100} />
            </div>
            <div>
              <label htmlFor={`${id}-per`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Personas</label>
              <input id={`${id}-per`} className="input-field" type="number" min={1} value={personas} onChange={(e) => setPersonas(e.target.value)} />
            </div>
            <div>
              <label htmlFor={`${id}-ini`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Desde</label>
              <input id={`${id}-ini`} className="input-field" type="datetime-local" value={inicio} onChange={(e) => setInicio(e.target.value)} required />
            </div>
            <div>
              <label htmlFor={`${id}-fin`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Hasta</label>
              <input id={`${id}-fin`} className="input-field" type="datetime-local" value={fin} onChange={(e) => setFin(e.target.value)} required />
            </div>
          </div>
          <div><button type="submit" className="btn-primary" disabled={!instalacionId}>Enviar solicitud</button></div>
        </form>
      )}

      {reservas === null ? (
        <Cargando texto="Cargando reservas…" />
      ) : reservas.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>No hay reservas registradas.</p>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th scope="col">Cuándo</th>
                <th scope="col">Qué</th>
                <th scope="col">Estado</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((r) => {
                const abierta = r.estado === 'SOLICITADA' || r.estado === 'APROBADA';
                return (
                  <tr key={r.id}>
                    <td>
                      {new Date(r.inicio).toLocaleString('es-PY')}
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>hasta {new Date(r.fin).toLocaleString('es-PY')}</div>
                    </td>
                    <td>
                      <strong>{r.titulo}</strong>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {nombreDe(r.instalacionId)} · {r.solicitanteNombre}{r.personas ? ` · ${r.personas} personas` : ''}
                      </div>
                      {r.motivoDecision && <div style={{ fontSize: 12, color: 'var(--muted)' }}>Motivo: {r.motivoDecision}</div>}
                    </td>
                    <td><span className="badge" style={{ background: FONDO[r.estado] }}>{ETIQUETA[r.estado]}</span></td>
                    <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {puedeDecidir && r.estado === 'SOLICITADA' && (
                        <>
                          <button type="button" className="btn-primary" onClick={() => ejecutar(() => decidirReserva(r.id, 'APROBAR'), 'Reserva aprobada')}>Aprobar</button>
                          <button type="button" style={BOTON_NEUTRO} onClick={() => rechazar(r)}>Rechazar</button>
                        </>
                      )}
                      {abierta && (puedeDecidir || r.creadoPor === miId) && (
                        <button type="button" style={BOTON_NEUTRO} onClick={() => cancelar(r)}>Cancelar</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {puedeDecidir && (
        <form
          className="card"
          style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}
          onSubmit={(e) => {
            e.preventDefault();
            ejecutar(async () => {
              await crearInstalacion({ nombre: nuevaInst, capacidad: nuevaCap ? Number(nuevaCap) : undefined });
              setNuevaInst('');
              setNuevaCap('');
            }, 'Instalación agregada');
          }}
        >
          <div style={{ flex: '1 1 220px' }}>
            <label htmlFor={`${id}-ni`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Agregar instalación reservable</label>
            <input id={`${id}-ni`} className="input-field" value={nuevaInst} onChange={(e) => setNuevaInst(e.target.value)} required minLength={2} maxLength={100} placeholder="Ej.: Salón de usos múltiples" />
          </div>
          <div>
            <label htmlFor={`${id}-nc`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Capacidad</label>
            <input id={`${id}-nc`} className="input-field" style={{ width: 110 }} type="number" min={1} value={nuevaCap} onChange={(e) => setNuevaCap(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary">Agregar</button>
        </form>
      )}
    </div>
  );
}
