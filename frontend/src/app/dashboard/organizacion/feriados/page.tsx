'use client';

import { Fragment, useEffect, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import {
  Feriado,
  Guardia,
  TIPOS_FERIADO,
  actualizarFeriado,
  cargarFeriados,
  crearFeriado,
  eliminarFeriado,
  moverFeriado,
} from '@/lib/guardias';

export default function FeriadosPage() {
  const [feriados, setFeriados] = useState<Feriado[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [incluirInactivos, setIncluirInactivos] = useState(false);

  const [fecha, setFecha] = useState('');
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('FIJO');
  const [esEspecial, setEsEspecial] = useState(true);
  const [observacion, setObservacion] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [moviendoId, setMoviendoId] = useState<string | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [motivoTraslado, setMotivoTraslado] = useState('');
  const [resultadoTraslado, setResultadoTraslado] = useState<{
    guardiasAfectadasFechaOriginal: Guardia[];
    guardiasAfectadasFechaNueva: Guardia[];
  } | null>(null);

  const puedeCrear = !!obtenerSesion()?.usuario.permisos.includes('organizacion:feriados_crear');
  const puedeEditar = !!obtenerSesion()?.usuario.permisos.includes('organizacion:feriados_editar');
  const puedeEliminar = !!obtenerSesion()?.usuario.permisos.includes('organizacion:feriados_eliminar');

  async function cargar() {
    try {
      setFeriados(await cargarFeriados(undefined, undefined, !incluirInactivos));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incluirInactivos]);

  function limpiar() {
    setEditandoId(null);
    setFecha('');
    setNombre('');
    setTipo('FIJO');
    setEsEspecial(true);
    setObservacion('');
  }

  function editar(f: Feriado) {
    setEditandoId(f.id);
    setFecha(f.fecha);
    setNombre(f.nombre);
    setTipo(f.tipo);
    setEsEspecial(f.esEspecial);
    setObservacion(f.observacion ?? '');
    setMostrarForm(true);
  }

  function cancelar() {
    limpiar();
    setMostrarForm(false);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      if (editandoId) {
        await actualizarFeriado(editandoId, { nombre, tipo, esEspecial, observacion: observacion || undefined });
        setMensaje('Feriado actualizado');
      } else {
        await crearFeriado({ fecha, nombre, tipo, esEspecial, observacion: observacion || undefined });
        setMensaje('Feriado creado');
      }
      limpiar();
      setMostrarForm(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(id: string) {
    if (!window.confirm('Desactivar este feriado? No se elimina fisicamente, se conserva el historico.')) return;
    setError(null);
    try {
      await eliminarFeriado(id);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  function abrirMover(f: Feriado) {
    setMoviendoId(f.id);
    setNuevaFecha(f.fecha);
    setMotivoTraslado('');
    setResultadoTraslado(null);
    setError(null);
  }

  async function confirmarMover(id: string) {
    if (!nuevaFecha || !motivoTraslado.trim()) {
      setError('Indica la nueva fecha y el motivo del traslado');
      return;
    }
    setError(null);
    try {
      const res = await moverFeriado(id, nuevaFecha, motivoTraslado.trim());
      setResultadoTraslado({
        guardiasAfectadasFechaOriginal: res.guardiasAfectadasFechaOriginal,
        guardiasAfectadasFechaNueva: res.guardiasAfectadasFechaNueva,
      });
      setMensaje('Feriado trasladado');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ fontSize: 16 }}>Feriados ({feriados?.length ?? 0})</h2>
        {puedeCrear && (
          <button className="btn-primary" onClick={() => (mostrarForm ? cancelar() : setMostrarForm(true))}>
            {mostrarForm ? 'Cancelar' : 'Nuevo feriado'}
          </button>
        )}
      </div>

      <p style={{ fontSize: 13, color: '#94a3b8' }}>
        Calendario institucional de feriados usado por la planificacion de guardias. Un feriado MOVIL puede
        trasladarse de fecha sin perder su historico: use &quot;Mover&quot; en vez de editar la fecha directamente.
        Trasladar un feriado nunca reclasifica guardias en forma automatica — revise manualmente las guardias
        afectadas que se muestran despues del traslado.
      </p>

      <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
        <input type="checkbox" checked={incluirInactivos} onChange={(e) => setIncluirInactivos(e.target.checked)} />
        Mostrar inactivos
      </label>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      {mostrarForm && (
        <form className="card" onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha</label>
              <input
                className="input-field"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                disabled={!!editandoId}
              />
              {editandoId && <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Para cambiar la fecha use &quot;Mover&quot;.</p>}
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
              <input className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo</label>
              <select className="input-field" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                {TIPOS_FERIADO.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={esEspecial} onChange={(e) => setEsEspecial(e.target.checked)} />
            Es fecha especial (aplica esquemas de horario especiales / sorteo)
          </label>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observacion</label>
            <input className="input-field" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" disabled={guardando}>{guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear feriado'}</button>
            <button type="button" className="btn-primary" style={{ background: '#475569' }} onClick={cancelar}>Cancelar</button>
          </div>
        </form>
      )}

      {feriados && feriados.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin feriados registrados.</p>}
      {feriados && feriados.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Fecha</th>
              <th style={{ padding: '6px 4px' }}>Nombre</th>
              <th style={{ padding: '6px 4px' }}>Tipo</th>
              <th style={{ padding: '6px 4px' }}>Especial</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
              <th style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {feriados.map((f) => (
              <Fragment key={f.id}>
                <tr style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '6px 4px' }}>
                    {f.fecha}
                    {f.tipo === 'TRASLADADO' && f.fechaOriginal && (
                      <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>(era {f.fechaOriginal})</span>
                    )}
                  </td>
                  <td style={{ padding: '6px 4px' }}>{f.nombre}</td>
                  <td style={{ padding: '6px 4px' }}><span className="badge">{f.tipo}</span></td>
                  <td style={{ padding: '6px 4px' }}>{f.esEspecial ? 'SI' : 'NO'}</td>
                  <td style={{ padding: '6px 4px' }}><span className="badge" style={{ background: f.activo ? '#166534' : '#7f1d1d' }}>{f.activo ? 'ACTIVO' : 'INACTIVO'}</span></td>
                  <td style={{ padding: '6px 4px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {puedeEditar && f.activo && (
                      <>
                        <button className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => editar(f)}>Editar</button>
                        <button className="btn-primary" style={{ padding: '4px 8px', fontSize: 12, background: '#1d4ed8' }} onClick={() => abrirMover(f)}>Mover</button>
                      </>
                    )}
                    {puedeEliminar && f.activo && (
                      <button style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: 6 }} onClick={() => eliminar(f.id)}>Desactivar</button>
                    )}
                  </td>
                </tr>
                {moviendoId === f.id && (
                  <tr>
                    <td colSpan={6} style={{ padding: '10px 4px', background: '#0f172a' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap' }}>
                          <div>
                            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nueva fecha</label>
                            <input className="input-field" type="date" value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} />
                          </div>
                          <div style={{ flex: 1, minWidth: 220 }}>
                            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Motivo del traslado</label>
                            <input className="input-field" value={motivoTraslado} onChange={(e) => setMotivoTraslado(e.target.value)} />
                          </div>
                          <button className="btn-primary" onClick={() => confirmarMover(f.id)}>Confirmar traslado</button>
                          <button type="button" className="btn-primary" style={{ background: '#475569' }} onClick={() => setMoviendoId(null)}>Cerrar</button>
                        </div>
                        {resultadoTraslado && (
                          <div style={{ fontSize: 12, color: '#e2e8f0' }}>
                            <p style={{ marginBottom: 4 }}>
                              Guardias en la fecha original ({resultadoTraslado.guardiasAfectadasFechaOriginal.length}):{' '}
                              {resultadoTraslado.guardiasAfectadasFechaOriginal.length === 0
                                ? 'ninguna'
                                : resultadoTraslado.guardiasAfectadasFechaOriginal.map((g) => `${g.fecha} (${g.estado})`).join(', ')}
                            </p>
                            <p>
                              Guardias en la fecha nueva ({resultadoTraslado.guardiasAfectadasFechaNueva.length}):{' '}
                              {resultadoTraslado.guardiasAfectadasFechaNueva.length === 0
                                ? 'ninguna'
                                : resultadoTraslado.guardiasAfectadasFechaNueva.map((g) => `${g.fecha} (${g.estado})`).join(', ')}
                            </p>
                            <p style={{ color: '#94a3b8', marginTop: 4 }}>
                              El sistema no modifico estas guardias automaticamente: revise y ajuste manualmente desde
                              el detalle de cada guardia si corresponde.
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
