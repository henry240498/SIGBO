'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import {
  BomberoResumen,
  TipoBombero,
  cargarBomberos,
  cargarTiposBombero,
  compararBomberosInstitucional,
  construirTipoPorId,
} from '@/lib/personal';
import { cargarParametros, Parametro } from '@/lib/parametros';
import {
  AsignacionGuardia,
  Guardia,
  InspeccionEstacion,
  NovedadGuardia,
  Pernocte,
  actualizarPresenciaAsignacion,
  asignarPersonalGuardia,
  cargarGuardia,
  crearInspeccionEstacion,
  crearNovedad,
  crearPernocte,
  listarAsignacionesGuardia,
  listarInspeccionesEstacion,
  listarNovedades,
  listarPernoctes,
  quitarAsignacionGuardia,
  registrarHorarioAsignacion,
} from '@/lib/guardias';

type Vista = 'personal' | 'pernoctes' | 'estacion' | 'novedades';
const SUBTABS: { id: Vista; label: string }[] = [
  { id: 'personal', label: 'Personal' },
  { id: 'pernoctes', label: 'Pernoctantes' },
  { id: 'estacion', label: 'Condicion de Estacion' },
  { id: 'novedades', label: 'Novedades' },
];

export default function DetalleGuardiaPage() {
  const params = useParams();
  const router = useRouter();
  const guardiaId = params.id as string;

  const [vista, setVista] = useState<Vista>('personal');
  const [guardia, setGuardia] = useState<Guardia | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    try {
      setGuardia(await cargarGuardia(guardiaId));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guardiaId]);

  if (error && !guardia) return <p style={{ color: '#f87171' }}>{error}</p>;
  if (!guardia) return <p style={{ color: '#94a3b8' }}>Cargando guardia...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: 18 }}>Guardia {guardia.fecha} — {guardia.turno}</h2>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <span className="badge">{guardia.horaInicio} - {guardia.horaFin}</span>
              <span className="badge">{guardia.tipo}</span>
              <span className="badge">{guardia.estado}</span>
            </div>
          </div>
          <button className="btn-primary" style={{ background: '#475569' }} onClick={() => router.push('/dashboard/guardias')}>
            Volver
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #1f2937' }}>
        {SUBTABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setVista(t.id)}
            style={{
              padding: '8px 12px',
              fontSize: 13,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: vista === t.id ? '#e2e8f0' : '#94a3b8',
              fontWeight: vista === t.id ? 600 : 400,
              borderBottom: vista === t.id ? '2px solid #2563eb' : '2px solid transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {vista === 'personal' && <TabPersonal guardiaId={guardiaId} />}
      {vista === 'pernoctes' && <TabPernoctes guardiaId={guardiaId} fecha={guardia.fecha} />}
      {vista === 'estacion' && <TabEstacion guardiaId={guardiaId} />}
      {vista === 'novedades' && <TabNovedades guardiaId={guardiaId} />}
    </div>
  );
}

const COLOR_TIPO_PARTICIPACION: Record<string, string> = { TITULAR: '#334155', REFUERZO: '#1d4ed8', REEMPLAZO: '#854d0e' };

function TabPersonal({ guardiaId }: { guardiaId: string }) {
  const [asignaciones, setAsignaciones] = useState<AsignacionGuardia[] | null>(null);
  const [bomberos, setBomberos] = useState<BomberoResumen[]>([]);
  const [tiposBombero, setTiposBombero] = useState<TipoBombero[]>([]);
  const [estadosPresencia, setEstadosPresencia] = useState<Parametro[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [bomberoSeleccionado, setBomberoSeleccionado] = useState('');
  const [rol, setRol] = useState('');
  const [tipoParticipacion, setTipoParticipacion] = useState<'TITULAR' | 'REFUERZO' | 'REEMPLAZO'>('TITULAR');
  const [reemplazaAsignacionId, setReemplazaAsignacionId] = useState('');
  const [motivo, setMotivo] = useState('');

  const [editandoHorario, setEditandoHorario] = useState<string | null>(null);
  const [horaEntrada, setHoraEntrada] = useState('');
  const [horaSalida, setHoraSalida] = useState('');
  const [estadoPresencia, setEstadoPresencia] = useState('');
  const [motivoPresencia, setMotivoPresencia] = useState('');

  const puedeAsignar = !!obtenerSesion()?.usuario.permisos.includes('guardias:asignar');
  const puedeEditar = !!obtenerSesion()?.usuario.permisos.includes('guardias:editar');
  const tipoBomberoPorId = useMemo(() => construirTipoPorId(tiposBombero), [tiposBombero]);

  async function cargarTodo() {
    try {
      setAsignaciones(await listarAsignacionesGuardia(guardiaId));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarTodo();
    cargarBomberos().then(setBomberos).catch(() => undefined);
    cargarTiposBombero().then(setTiposBombero);
    cargarParametros('ESTADO_PRESENCIA_GUARDIA').then(setEstadosPresencia).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guardiaId]);

  const opcionesBombero = useMemo(() => {
    const yaAsignados = new Set((asignaciones ?? []).filter((a) => a.estado !== 'REEMPLAZADO').map((a) => a.bomberoId));
    const disponibles = tipoParticipacion === 'REEMPLAZO' ? bomberos : bomberos.filter((b) => !yaAsignados.has(b.id));
    const ordenados = [...disponibles].sort((a, b) => compararBomberosInstitucional(a, b, tipoBomberoPorId));
    return ordenados.map((b) => ({ value: b.id, label: `${b.numeroBombero} — ${b.nombre} ${b.apellido}` }));
  }, [bomberos, asignaciones, tipoBomberoPorId, tipoParticipacion]);

  const opcionesReemplazo = useMemo(
    () => (asignaciones ?? [])
      .filter((a) => a.estado !== 'REEMPLAZADO')
      .map((a) => ({ value: a.id, label: `${a.codigoBombero ?? ''} — ${a.nombreCompleto}${a.rol ? ` (${a.rol})` : ''}` })),
    [asignaciones],
  );

  async function asignar() {
    if (!bomberoSeleccionado) return;
    if (tipoParticipacion === 'REEMPLAZO' && !reemplazaAsignacionId) {
      setError('Selecciona a quien reemplaza');
      return;
    }
    setError(null);
    setMensaje(null);
    try {
      await asignarPersonalGuardia(guardiaId, {
        bomberoId: bomberoSeleccionado,
        rol: rol || undefined,
        tipoParticipacion,
        reemplazaAsignacionId: tipoParticipacion === 'REEMPLAZO' ? reemplazaAsignacionId : undefined,
        motivo: motivo || undefined,
      });
      setBomberoSeleccionado('');
      setRol('');
      setReemplazaAsignacionId('');
      setMotivo('');
      setMensaje('Personal asignado');
      await cargarTodo();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function quitar(asignacionId: string) {
    if (!window.confirm('Quitar esta asignacion?')) return;
    setError(null);
    try {
      await quitarAsignacionGuardia(guardiaId, asignacionId);
      await cargarTodo();
    } catch (err: any) {
      setError(err.message);
    }
  }

  function abrirHorario(a: AsignacionGuardia) {
    setEditandoHorario(a.id);
    setHoraEntrada(a.horaEntrada ? a.horaEntrada.slice(0, 16) : '');
    setHoraSalida(a.horaSalida ? a.horaSalida.slice(0, 16) : '');
    setEstadoPresencia(a.estadoPresencia ?? '');
    setMotivoPresencia(a.motivo ?? '');
  }

  async function guardarHorario(asignacionId: string) {
    setError(null);
    try {
      if (horaEntrada || horaSalida) {
        await registrarHorarioAsignacion(guardiaId, asignacionId, {
          horaEntrada: horaEntrada || undefined,
          horaSalida: horaSalida || undefined,
        });
      }
      if (estadoPresencia) {
        await actualizarPresenciaAsignacion(guardiaId, asignacionId, {
          estadoPresencia,
          motivo: motivoPresencia || undefined,
        });
      }
      setEditandoHorario(null);
      await cargarTodo();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      {puedeAsignar && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap' }}>
            <div style={{ minWidth: 280 }}>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Bombero</label>
              <ComboBuscable opciones={opcionesBombero} value={bomberoSeleccionado} onChange={setBomberoSeleccionado} placeholderBusqueda="Buscar por codigo o nombre..." />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo</label>
              <select className="input-field" value={tipoParticipacion} onChange={(e) => setTipoParticipacion(e.target.value as any)}>
                <option value="TITULAR">TITULAR</option>
                <option value="REFUERZO">REFUERZO</option>
                <option value="REEMPLAZO">REEMPLAZO</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Rol (opcional)</label>
              <input className="input-field" value={rol} onChange={(e) => setRol(e.target.value)} placeholder="OFICIAL_A_CARGO, CHOFER..." />
            </div>
            {tipoParticipacion === 'REEMPLAZO' && (
              <div style={{ minWidth: 260 }}>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>A quien reemplaza</label>
                <ComboBuscable opciones={opcionesReemplazo} value={reemplazaAsignacionId} onChange={setReemplazaAsignacionId} placeholderBusqueda="Buscar..." />
              </div>
            )}
            {tipoParticipacion !== 'TITULAR' && (
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Motivo</label>
                <input className="input-field" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
              </div>
            )}
            <button className="btn-primary" onClick={asignar} disabled={!bomberoSeleccionado}>
              Asignar
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: 14, marginBottom: 10 }}>Personal ({asignaciones?.length ?? 0})</h3>
        {asignaciones && asignaciones.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin personal asignado.</p>}
        {asignaciones && asignaciones.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '6px 4px' }}>Bombero</th>
                <th style={{ padding: '6px 4px' }}>Rol</th>
                <th style={{ padding: '6px 4px' }}>Tipo</th>
                <th style={{ padding: '6px 4px' }}>Estado</th>
                <th style={{ padding: '6px 4px' }}>Presencia</th>
                <th style={{ padding: '6px 4px' }}>Horario real</th>
                {puedeEditar && <th style={{ padding: '6px 4px' }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {asignaciones.map((a) => (
                <Fragment key={a.id}>
                  <tr style={{ borderBottom: '1px solid #1f2937' }}>
                    <td style={{ padding: '6px 4px' }}>{a.codigoBombero ? `${a.codigoBombero} — ` : ''}{a.nombreCompleto}</td>
                    <td style={{ padding: '6px 4px' }}>{a.rol ?? ''}</td>
                    <td style={{ padding: '6px 4px' }}>
                      <span className="badge" style={{ background: COLOR_TIPO_PARTICIPACION[a.tipoParticipacion] }}>{a.tipoParticipacion}</span>
                    </td>
                    <td style={{ padding: '6px 4px' }}><span className="badge">{a.estado}</span></td>
                    <td style={{ padding: '6px 4px' }}>{a.estadoPresencia ?? '—'}</td>
                    <td style={{ padding: '6px 4px' }}>
                      {a.horaEntrada ? new Date(a.horaEntrada).toLocaleTimeString() : '—'} / {a.horaSalida ? new Date(a.horaSalida).toLocaleTimeString() : '—'}
                    </td>
                    {puedeEditar && (
                      <td style={{ padding: '6px 4px', display: 'flex', gap: 6 }}>
                        <button className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => abrirHorario(a)}>
                          Horario/Presencia
                        </button>
                        <button className="btn-primary" style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d' }} onClick={() => quitar(a.id)}>
                          Quitar
                        </button>
                      </td>
                    )}
                  </tr>
                  {editandoHorario === a.id && (
                    <tr>
                      <td colSpan={7} style={{ padding: '10px 4px', background: '#0f172a' }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap' }}>
                          <div>
                            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Hora entrada real</label>
                            <input className="input-field" type="datetime-local" value={horaEntrada} onChange={(e) => setHoraEntrada(e.target.value)} />
                          </div>
                          <div>
                            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Hora salida real</label>
                            <input className="input-field" type="datetime-local" value={horaSalida} onChange={(e) => setHoraSalida(e.target.value)} />
                          </div>
                          <div>
                            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado de presencia</label>
                            <select className="input-field" value={estadoPresencia} onChange={(e) => setEstadoPresencia(e.target.value)}>
                              <option value="">-- sin cambio --</option>
                              {estadosPresencia.map((p) => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Motivo</label>
                            <input className="input-field" value={motivoPresencia} onChange={(e) => setMotivoPresencia(e.target.value)} />
                          </div>
                          <button className="btn-primary" onClick={() => guardarHorario(a.id)}>Guardar</button>
                          <button style={{ background: '#475569', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px' }} onClick={() => setEditandoHorario(null)}>Cancelar</button>
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
    </div>
  );
}

function TabPernoctes({ guardiaId, fecha }: { guardiaId: string; fecha: string }) {
  const [pernoctes, setPernoctes] = useState<Pernocte[] | null>(null);
  const [bomberos, setBomberos] = useState<BomberoResumen[]>([]);
  const [bomberoId, setBomberoId] = useState('');
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const puedeEditar = !!obtenerSesion()?.usuario.permisos.includes('guardias:editar');
  const opcionesBombero = useMemo(() => bomberos.map((b) => ({ value: b.id, label: `${b.numeroBombero} — ${b.nombre} ${b.apellido}` })), [bomberos]);

  async function cargar() {
    try {
      setPernoctes(await listarPernoctes(undefined, guardiaId));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    cargarBomberos().then(setBomberos).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guardiaId]);

  async function agregar() {
    if (!bomberoId) return;
    setError(null);
    try {
      await crearPernocte({ guardiaId, fecha, bomberoId, motivo: motivo || undefined });
      setBomberoId('');
      setMotivo('');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 13, color: '#94a3b8' }}>
        Pernoctar no es lo mismo que estar de guardia: estas personas se quedan a dormir en el cuartel sin formar
        parte del personal asignado a esta guardia.
      </p>
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {puedeEditar && (
        <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 280 }}>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Bombero</label>
            <ComboBuscable opciones={opcionesBombero} value={bomberoId} onChange={setBomberoId} placeholderBusqueda="Buscar por codigo o nombre..." />
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Motivo (opcional)</label>
            <input className="input-field" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={agregar} disabled={!bomberoId}>Registrar pernocte</button>
        </div>
      )}
      {pernoctes && pernoctes.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin pernoctantes registrados.</p>}
      {pernoctes && pernoctes.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
            <th style={{ padding: '6px 4px' }}>Bombero</th><th style={{ padding: '6px 4px' }}>Motivo</th><th style={{ padding: '6px 4px' }}>Observacion</th>
          </tr></thead>
          <tbody>{pernoctes.map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid #1f2937' }}>
              <td style={{ padding: '6px 4px' }}>{p.codigoBombero ? `${p.codigoBombero} — ` : ''}{p.nombreCompleto}</td>
              <td style={{ padding: '6px 4px' }}>{p.motivo ?? '—'}</td>
              <td style={{ padding: '6px 4px' }}>{p.observacion ?? '—'}</td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
}

function TabEstacion({ guardiaId }: { guardiaId: string }) {
  const [inspecciones, setInspecciones] = useState<InspeccionEstacion[] | null>(null);
  const [sectores, setSectores] = useState<Parametro[]>([]);
  const [sector, setSector] = useState('');
  const [estado, setEstado] = useState<'OK' | 'NO_OK'>('OK');
  const [observacion, setObservacion] = useState('');
  const [error, setError] = useState<string | null>(null);

  const puedeEditar = !!obtenerSesion()?.usuario.permisos.includes('guardias:editar');

  async function cargar() {
    try {
      setInspecciones(await listarInspeccionesEstacion(guardiaId));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    cargarParametros('SECTOR_ESTACION').then(setSectores).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guardiaId]);

  async function agregar() {
    if (!sector) return;
    setError(null);
    try {
      await crearInspeccionEstacion(guardiaId, { sector, estado, observacion: observacion || undefined });
      setSector('');
      setObservacion('');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {puedeEditar && (
        <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Sector</label>
            <select className="input-field" value={sector} onChange={(e) => setSector(e.target.value)}>
              <option value="">-- seleccionar --</option>
              {sectores.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado</label>
            <select className="input-field" value={estado} onChange={(e) => setEstado(e.target.value as 'OK' | 'NO_OK')}>
              <option value="OK">OK</option>
              <option value="NO_OK">NO OK</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observacion</label>
            <input className="input-field" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={agregar} disabled={!sector}>Registrar</button>
        </div>
      )}
      {inspecciones && inspecciones.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin inspecciones registradas.</p>}
      {inspecciones && inspecciones.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
            <th style={{ padding: '6px 4px' }}>Sector</th><th style={{ padding: '6px 4px' }}>Estado</th><th style={{ padding: '6px 4px' }}>Observacion</th>
          </tr></thead>
          <tbody>{inspecciones.map((i) => (
            <tr key={i.id} style={{ borderBottom: '1px solid #1f2937' }}>
              <td style={{ padding: '6px 4px' }}>{i.sectorNombre}</td>
              <td style={{ padding: '6px 4px' }}><span className="badge" style={{ background: i.estado === 'OK' ? '#166534' : '#7f1d1d' }}>{i.estado}</span></td>
              <td style={{ padding: '6px 4px' }}>{i.observacion ?? '—'}</td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
}

function TabNovedades({ guardiaId }: { guardiaId: string }) {
  const [novedades, setNovedades] = useState<NovedadGuardia[] | null>(null);
  const [texto, setTexto] = useState('');
  const [error, setError] = useState<string | null>(null);

  const puedeEditar = !!obtenerSesion()?.usuario.permisos.includes('guardias:editar');

  async function cargar() {
    try {
      setNovedades(await listarNovedades(guardiaId));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guardiaId]);

  async function agregar() {
    if (!texto.trim()) return;
    setError(null);
    try {
      await crearNovedad(guardiaId, { texto });
      setTexto('');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {puedeEditar && (
        <div className="card" style={{ display: 'flex', gap: 10 }}>
          <input className="input-field" style={{ flex: 1 }} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Nueva novedad..." />
          <button className="btn-primary" onClick={agregar} disabled={!texto.trim()}>Agregar</button>
        </div>
      )}
      {novedades && novedades.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin novedades registradas.</p>}
      {novedades && novedades.length > 0 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {novedades.map((n) => (
            <div key={n.id} style={{ display: 'flex', gap: 10, fontSize: 13, borderBottom: '1px solid #1f2937', paddingBottom: 8 }}>
              <span style={{ color: '#94a3b8', minWidth: 140 }}>{new Date(n.fechaHora).toLocaleString()}</span>
              <span>{n.texto}{n.autorNombre ? ` — ${n.autorNombre}` : ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
