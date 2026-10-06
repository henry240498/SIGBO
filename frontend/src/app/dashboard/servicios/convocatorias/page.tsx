'use client';

import { useEffect, useId, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import {
  Convocatoria,
  DetalleConvocatoria,
  cargarConvocatorias,
  cargarDetalleConvocatoria,
  cerrarConvocatoria,
  crearConvocatoria,
} from '@/lib/llamados';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';

const REFRESCO_MS = 10000;

export default function ConvocatoriasPage() {
  const id = useId();
  const [lista, setLista] = useState<Convocatoria[] | null>(null);
  const [abierta, setAbierta] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<DetalleConvocatoria | null>(null);
  const [mensajeNuevo, setMensajeNuevo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const puedeConvocar = !!obtenerSesion()?.usuario.permisos.includes('servicios:convocar');

  async function cargar() {
    if (!puedeConvocar) return;
    try {
      setLista(await cargarConvocatorias());
      if (abierta) setDetalle(await cargarDetalleConvocatoria(abierta));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    const timer = setInterval(cargar, REFRESCO_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierta]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAviso(null);
    setEnviando(true);
    try {
      const c = await crearConvocatoria(mensajeNuevo);
      setMensajeNuevo('');
      setAviso('Convocatoria enviada. Los celulares la reciben en segundos.');
      setAbierta(c.id);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  async function cerrar(c: Convocatoria) {
    setError(null);
    try {
      await cerrarConvocatoria(c.id);
      setAviso('Convocatoria cerrada');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (!puedeConvocar) {
    return <p style={{ color: 'var(--muted)', fontSize: 13 }}>No tiene permiso para convocar al personal.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 16 }}>Convocatorias</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          Avise al personal y vea quién responde «voy» y en cuántos minutos llega. Informa y registra: no obliga a nadie.
        </p>
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {aviso && <Aviso tipo="exito" texto={aviso} fontSize={13} />}

      <form className="card" onSubmit={crear} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <label htmlFor={`${id}-msg`} style={{ fontSize: 12 }}>Mensaje para el personal</label>
        <textarea
          id={`${id}-msg`}
          className="input-field"
          rows={2}
          value={mensajeNuevo}
          onChange={(e) => setMensajeNuevo(e.target.value)}
          maxLength={500}
          minLength={3}
          required
          placeholder="Ej.: Incendio en Av. Principal 123, presentarse en el cuartel"
        />
        <div>
          <button type="submit" className="btn-primary" disabled={enviando}>Convocar</button>
        </div>
      </form>

      {lista === null ? (
        <Cargando texto="Cargando convocatorias…" />
      ) : lista.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>Todavía no hay convocatorias.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lista.map((c) => {
            const seleccionada = abierta === c.id;
            return (
              <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <strong>{c.mensaje}</strong>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(c.creadoEn).toLocaleString('es-PY')}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className="badge" style={{ background: c.estado === 'ABIERTA' ? 'var(--ok-fill)' : 'var(--neutral-fill)' }}>
                      {c.estado === 'ABIERTA' ? 'Abierta' : 'Cerrada'}
                    </span>
                    <button
                      type="button"
                      style={{ background: 'var(--neutral-fill)', color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 8, padding: '6px 10px', fontSize: 13, cursor: 'pointer' }}
                      aria-expanded={seleccionada}
                      onClick={() => {
                        setDetalle(null);
                        setAbierta(seleccionada ? null : c.id);
                      }}
                    >
                      {seleccionada ? 'Ocultar respuestas' : 'Ver respuestas'}
                    </button>
                    {c.estado === 'ABIERTA' && (
                      <button type="button" className="btn-primary" onClick={() => cerrar(c)}>Cerrar</button>
                    )}
                  </div>
                </div>
                {seleccionada && (
                  detalle === null ? (
                    <Cargando texto="Cargando respuestas…" filas={2} />
                  ) : (
                    <div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <span className="badge" style={{ background: 'var(--ok-fill)' }}>Van: {detalle.totales.voy}</span>
                        <span className="badge" style={{ background: 'var(--neutral-fill)' }}>No pueden: {detalle.totales.noPuedo}</span>
                      </div>
                      {detalle.respuestas.length === 0 ? (
                        <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Nadie respondió todavía.</p>
                      ) : (
                        <table>
                          <thead>
                            <tr>
                              <th scope="col">Bombero</th>
                              <th scope="col">Estado</th>
                              <th scope="col">Llega en</th>
                              <th scope="col">Hora</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detalle.respuestas.map((r) => (
                              <tr key={r.id}>
                                <td>{r.usuarioNombre}</td>
                                <td>{r.respuesta === 'VOY'
                                  ? r.canceladaEn ? 'Canceló asistencia' : r.enCaminoEn ? 'En camino' : 'Aceptó'
                                  : 'No puede asistir'}{r.motivo ? ` · ${r.motivo}` : ''}</td>
                                <td>{r.etaMinutos !== null ? `${r.etaMinutos} min` : '—'}</td>
                                <td>{new Date(r.respondidoEn).toLocaleTimeString('es-PY')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                      <h3 style={{ fontSize: 13, margin: '14px 0 6px' }}>Historial</h3>
                      {detalle.eventos.length === 0 ? (
                        <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>Sin respuestas registradas.</p>
                      ) : (
                        <ol style={{ margin: 0, paddingLeft: 22, fontSize: 12 }}>
                          {detalle.eventos.map((evento) => (
                            <li key={evento.id} style={{ padding: '3px 0' }}>
                              <time dateTime={evento.ocurridoEn}>{new Date(evento.ocurridoEn).toLocaleString('es-PY')}</time>
                              {' — '}{evento.usuarioNombre}: {({
                                ACEPTAR: 'aceptó',
                                RECHAZAR: 'indicó que no puede asistir',
                                CAMBIAR_RESPUESTA: 'cambió su respuesta',
                                EN_CAMINO: 'indicó que está en camino',
                                CANCELAR_ASISTENCIA: 'canceló su asistencia',
                                LLEGAR: 'registró llegada',
                              } as const)[evento.accion]}
                              {evento.motivo ? ` · ${evento.motivo}` : ''}
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
