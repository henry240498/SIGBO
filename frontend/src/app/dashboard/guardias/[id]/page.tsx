'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { useEntradaConfirmada } from '@/app/components/InputProvider';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { useParams, useRouter } from 'next/navigation';
import { obtenerSesion } from '@/lib/api';
import { formatearJsonSeguro } from '@/lib/json-seguro';
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
  Bitacora,
  ESTADOS_GUARDIA,
  Guardia,
  InspeccionEstacion,
  InspeccionMovil,
  MovilARevisar,
  NovedadGuardia,
  Pernocte,
  TIPOS_GUARDIA_REGISTRO,
  TURNOS_GUARDIA,
  actualizarGuardia,
  actualizarPresenciaAsignacion,
  anularGuardia,
  asignarPersonalGuardia,
  cargarBitacora,
  cargarGuardia,
  cargarMovilesARevisar,
  cerrarGuardia,
  crearInspeccionEstacion,
  crearInspeccionMovil,
  crearNovedad,
  crearPernocte,
  listarAsignacionesGuardia,
  listarInspeccionesEstacion,
  listarInspeccionesMovil,
  listarNovedades,
  listarPernoctes,
  quitarAsignacionGuardia,
  reabrirGuardia,
  registrarHorarioAsignacion,
  reemplazarAsignacionGuardia,
} from '@/lib/guardias';
import { Cargando } from '@/app/components/Cargando';
import { Aviso } from '@/app/components/Aviso';

type Vista = 'personal' | 'pernoctes' | 'estacion' | 'moviles' | 'novedades' | 'bitacora';
const SUBTABS: { id: Vista; label: string }[] = [
  { id: 'personal', label: 'Personal' },
  { id: 'pernoctes', label: 'Pernoctantes' },
  { id: 'estacion', label: 'Condicion de Estacion' },
  { id: 'moviles', label: 'Condicion de Moviles' },
  { id: 'novedades', label: 'Novedades' },
  { id: 'bitacora', label: 'Bitacora' },
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

  if (error && !guardia) return <p style={{ color: 'var(--danger)' }}>{error}</p>;
  if (!guardia) return <Cargando texto="Cargando guardia…" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <CabeceraGuardia guardia={guardia} onCambiada={cargar} onVolver={() => router.push('/dashboard/guardias')} />

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--line-soft)' }}>
        {SUBTABS.map((t) => (
          <button type="button"
            key={t.id}
            onClick={() => setVista(t.id)}
            style={{
              padding: '8px 12px',
              fontSize: 13,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: vista === t.id ? 'var(--ink)' : 'var(--muted)',
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
      {vista === 'moviles' && <TabMoviles guardiaId={guardiaId} />}
      {vista === 'novedades' && <TabNovedades guardiaId={guardiaId} />}
      {vista === 'bitacora' && <TabBitacora guardiaId={guardiaId} />}
    </div>
  );
}

function CabeceraGuardia({
  guardia,
  onCambiada,
  onVolver,
}: {
  guardia: Guardia;
  onCambiada: () => void;
  onVolver: () => void;
}) {
  const solicitarEntrada = useEntradaConfirmada();
  const [editando, setEditando] = useState(false);
  const [fecha, setFecha] = useState(guardia.fecha);
  const [turno, setTurno] = useState(guardia.turno);
  const [tipo, setTipo] = useState(guardia.tipo);
  const [horaInicio, setHoraInicio] = useState(guardia.horaInicio.slice(0, 5));
  const [horaFin, setHoraFin] = useState(guardia.horaFin.slice(0, 5));
  const [estado, setEstado] = useState(guardia.estado);
  const [observaciones, setObservaciones] = useState(guardia.observaciones ?? '');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const puedeEditar = !!obtenerSesion()?.usuario.permisos.includes('guardias:editar');
  const puedeAnular = !!obtenerSesion()?.usuario.permisos.includes('guardias:eliminar');

  function abrirEdicion() {
    setFecha(guardia.fecha);
    setTurno(guardia.turno);
    setTipo(guardia.tipo);
    setHoraInicio(guardia.horaInicio.slice(0, 5));
    setHoraFin(guardia.horaFin.slice(0, 5));
    setEstado(guardia.estado);
    setObservaciones(guardia.observaciones ?? '');
    setError(null);
    setEditando(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await actualizarGuardia(guardia.id, {
        fecha,
        turno,
        tipo,
        horaInicio,
        horaFin,
        estado,
        observaciones: observaciones || undefined,
      });
      setEditando(false);
      onCambiada();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function anular() {
    const motivo = await solicitarEntrada({ titulo: 'Anular guardia', mensaje: 'La anulación requiere un motivo.', etiqueta: 'Motivo', confirmar: 'Anular', peligro: true, requerida: true });
    if (motivo == null) return;
    setError(null);
    try {
      await anularGuardia(guardia.id, motivo.trim());
      onCambiada();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function cerrar() {
    const observacion = (await solicitarEntrada({ titulo: 'Cerrar guardia', mensaje: 'Puede registrar una observación para el cierre.', etiqueta: 'Observación', confirmar: 'Cerrar' })) ?? undefined;
    setError(null);
    try {
      await cerrarGuardia(guardia.id, observacion || undefined);
      onCambiada();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function reabrir() {
    const motivo = await solicitarEntrada({ titulo: 'Reabrir guardia', mensaje: 'La reapertura requiere un motivo.', etiqueta: 'Motivo', confirmar: 'Reabrir', requerida: true });
    if (motivo == null) return;
    setError(null);
    try {
      await reabrirGuardia(guardia.id, motivo.trim());
      onCambiada();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (editando) {
    return (
      <form className="card" onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {error && <Aviso tipo="error" texto={error} />}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', gap: 10 }}>
          <div>
            <label htmlFor="fecha" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha</label>
            <input id="fecha" className="input-field" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="turno" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Turno</label>
            <select id="turno" className="input-field" value={turno} onChange={(e) => setTurno(e.target.value)}>
              {TURNOS_GUARDIA.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="tipo" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo</label>
            <select id="tipo" className="input-field" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              {TIPOS_GUARDIA_REGISTRO.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="hora-inicio" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Hora inicio</label>
            <input id="hora-inicio" className="input-field" type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="hora-fin" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Hora fin</label>
            <input id="hora-fin" className="input-field" type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="estado" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado</label>
            <select id="estado" className="input-field" value={estado} onChange={(e) => setEstado(e.target.value)}>
              {ESTADOS_GUARDIA.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="observaciones" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observaciones</label>
          <input id="observaciones" className="input-field" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn-primary" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar cambios'}</button>
          <button type="button" className="btn-primary" style={{ background: '#475569' }} onClick={() => setEditando(false)}>
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="card">
      {error && <Aviso tipo="error" texto={error} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 18 }}>Guardia {guardia.fecha} — {guardia.turno}</h2>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            <span className="badge">{guardia.horaInicio} - {guardia.horaFin}</span>
            <span className="badge">{guardia.tipo}</span>
            <span className="badge" style={{ background: guardia.estado === 'ANULADA' || guardia.estado === 'CANCELADA' ? 'var(--bad-fill)' : guardia.estado === 'FINALIZADA' ? 'var(--ok-fill)' : 'var(--neutral-fill)' }}>
              {guardia.estado}
            </span>
          </div>
          {guardia.observaciones && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, whiteSpace: 'pre-wrap' }}>{guardia.observaciones}</p>}
          {guardia.estado === 'FINALIZADA' && guardia.cerradaEn && (
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
              Cerrada el {new Date(guardia.cerradaEn).toLocaleString()}
              {guardia.cierreObservacion ? ` — ${guardia.cierreObservacion}` : ''}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {puedeEditar && guardia.estado !== 'ANULADA' && (
            <button type="button" className="btn-primary" onClick={abrirEdicion}>Editar</button>
          )}
          {puedeEditar && guardia.estado !== 'ANULADA' && guardia.estado !== 'FINALIZADA' && (
            <button type="button" className="btn-primary" style={{ background: '#166534' }} onClick={cerrar}>Cerrar guardia</button>
          )}
          {puedeEditar && guardia.estado === 'FINALIZADA' && (
            <button type="button" className="btn-primary" style={{ background: '#1d4ed8' }} onClick={reabrir}>Reabrir</button>
          )}
          {puedeAnular && guardia.estado !== 'ANULADA' && (
            <button type="button" className="btn-primary" style={{ background: '#7f1d1d' }} onClick={anular}>Anular</button>
          )}
          <button type="button" className="btn-primary" style={{ background: '#475569' }} onClick={onVolver}>
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}

const COLOR_TIPO_PARTICIPACION: Record<string, string> = { TITULAR: 'var(--neutral-fill)', REFUERZO: 'var(--info-fill)', REEMPLAZO: 'var(--warn-fill)' };

function TabPersonal({ guardiaId }: { guardiaId: string }) {
  const confirmar = useConfirmacion();
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

  const [reemplazandoId, setReemplazandoId] = useState<string | null>(null);
  const [bomberoReemplazoId, setBomberoReemplazoId] = useState('');
  const [motivoReemplazo, setMotivoReemplazo] = useState('');

  const puedeAsignar = !!obtenerSesion()?.usuario.permisos.includes('guardias:asignar');
  const puedeEditar = !!obtenerSesion()?.usuario.permisos.includes('guardias:editar');
  const puedeReemplazar = !!obtenerSesion()?.usuario.permisos.includes('guardias:reemplazar');
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
    if (!await confirmar({ titulo: 'Confirmar acción', mensaje: 'Quitar esta asignacion?', confirmar: 'Continuar', peligro: true })) return;
    setError(null);
    try {
      await quitarAsignacionGuardia(guardiaId, asignacionId);
      await cargarTodo();
    } catch (err: any) {
      setError(err.message);
    }
  }

  function abrirReemplazo(a: AsignacionGuardia) {
    setReemplazandoId(a.id);
    setBomberoReemplazoId('');
    setMotivoReemplazo('');
    setError(null);
  }

  async function confirmarReemplazo(asignacionId: string) {
    if (!bomberoReemplazoId) return;
    setError(null);
    try {
      await reemplazarAsignacionGuardia(guardiaId, asignacionId, {
        bomberoNuevoId: bomberoReemplazoId,
        motivo: motivoReemplazo || undefined,
      });
      setReemplazandoId(null);
      setMensaje('Reemplazo registrado');
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
      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {puedeAsignar && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap' }}>
            <div style={{ minWidth: 280 }}>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Bombero</label>
              <ComboBuscable ariaLabel="Bombero" opciones={opcionesBombero} value={bomberoSeleccionado} onChange={setBomberoSeleccionado} placeholderBusqueda="Buscar por codigo o nombre..." />
            </div>
            <div>
              <label htmlFor="tipo-2" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo</label>
              <select id="tipo-2" className="input-field" value={tipoParticipacion} onChange={(e) => setTipoParticipacion(e.target.value as any)}>
                <option value="TITULAR">TITULAR</option>
                <option value="REFUERZO">REFUERZO</option>
                <option value="REEMPLAZO">REEMPLAZO</option>
              </select>
            </div>
            <div>
              <label htmlFor="rol-opcional" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Rol (opcional)</label>
              <input id="rol-opcional" className="input-field" value={rol} onChange={(e) => setRol(e.target.value)} placeholder="OFICIAL_A_CARGO, CHOFER..." />
            </div>
            {tipoParticipacion === 'REEMPLAZO' && (
              <div style={{ minWidth: 260 }}>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>A quien reemplaza</label>
                <ComboBuscable ariaLabel="A quien reemplaza" opciones={opcionesReemplazo} value={reemplazaAsignacionId} onChange={setReemplazaAsignacionId} placeholderBusqueda="Buscar..." />
              </div>
            )}
            {tipoParticipacion !== 'TITULAR' && (
              <div>
                <label htmlFor="motivo" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Motivo</label>
                <input id="motivo" className="input-field" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
              </div>
            )}
            <button type="button" className="btn-primary" onClick={asignar} disabled={!bomberoSeleccionado}>
              Asignar
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: 14, marginBottom: 10 }}>Personal ({asignaciones?.length ?? 0})</h3>
        {asignaciones && asignaciones.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin personal asignado.</p>}
        {asignaciones && asignaciones.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                <th scope="col" style={{ padding: '6px 4px' }}>Bombero</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Rol</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Tipo</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Presencia</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Horario real</th>
                {puedeEditar && <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {asignaciones.map((a) => (
                <Fragment key={a.id}>
                  <tr style={{ borderBottom: '1px solid var(--line-soft)' }}>
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
                      <td style={{ padding: '6px 4px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => abrirHorario(a)}>
                          Horario/Presencia
                        </button>
                        {puedeReemplazar && a.estado !== 'REEMPLAZADO' && (
                          <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12, background: '#1d4ed8' }} onClick={() => abrirReemplazo(a)}>
                            Reemplazar
                          </button>
                        )}
                        <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d' }} onClick={() => quitar(a.id)}>
                          Quitar
                        </button>
                      </td>
                    )}
                  </tr>
                  {reemplazandoId === a.id && (
                    <tr>
                      <td colSpan={7} style={{ padding: '10px 4px', background: 'var(--surface-soft)' }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap' }}>
                          <div style={{ minWidth: 260 }}>
                            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Reemplazar con</label>
                            <ComboBuscable ariaLabel="Reemplazar con"
                              opciones={opcionesBombero}
                              value={bomberoReemplazoId}
                              onChange={setBomberoReemplazoId}
                              placeholderBusqueda="Buscar por codigo o nombre..."
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Motivo (opcional)</label>
                            <input aria-label="Motivo (opcional)" className="input-field" value={motivoReemplazo} onChange={(e) => setMotivoReemplazo(e.target.value)} />
                          </div>
                          <button type="button" className="btn-primary" onClick={() => confirmarReemplazo(a.id)} disabled={!bomberoReemplazoId}>Confirmar reemplazo</button>
                          <button type="button" style={{ background: '#475569', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px' }} onClick={() => setReemplazandoId(null)}>Cancelar</button>
                        </div>
                        {a.rol && (
                          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
                            {a.rol === 'OFICIAL_A_CARGO' ? 'Solo se permite otro Oficial a Cargo de rango igual o mayor (si esta regla esta activa en la configuracion de Ordenes de Guardia).' : a.rol === 'CHOFER' ? 'Solo se permite otro personal con autorizacion de chofer.' : ''}
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                  {editandoHorario === a.id && (
                    <tr>
                      <td colSpan={7} style={{ padding: '10px 4px', background: 'var(--surface-soft)' }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap' }}>
                          <div>
                            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Hora entrada real</label>
                            <input aria-label="Hora entrada real" className="input-field" type="datetime-local" value={horaEntrada} onChange={(e) => setHoraEntrada(e.target.value)} />
                          </div>
                          <div>
                            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Hora salida real</label>
                            <input aria-label="Hora salida real" className="input-field" type="datetime-local" value={horaSalida} onChange={(e) => setHoraSalida(e.target.value)} />
                          </div>
                          <div>
                            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado de presencia</label>
                            <select aria-label="Estado de presencia" className="input-field" value={estadoPresencia} onChange={(e) => setEstadoPresencia(e.target.value)}>
                              <option value="">-- sin cambio --</option>
                              {estadosPresencia.map((p) => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Motivo</label>
                            <input aria-label="Motivo" className="input-field" value={motivoPresencia} onChange={(e) => setMotivoPresencia(e.target.value)} />
                          </div>
                          <button type="button" className="btn-primary" onClick={() => guardarHorario(a.id)}>Guardar</button>
                          <button type="button" style={{ background: '#475569', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px' }} onClick={() => setEditandoHorario(null)}>Cancelar</button>
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
      <p style={{ fontSize: 13, color: 'var(--muted)' }}>
        Pernoctar no es lo mismo que estar de guardia: estas personas se quedan a dormir en el cuartel sin formar
        parte del personal asignado a esta guardia.
      </p>
      {error && <Aviso tipo="error" texto={error} />}
      {puedeEditar && (
        <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 280 }}>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Bombero</label>
            <ComboBuscable ariaLabel="Bombero" opciones={opcionesBombero} value={bomberoId} onChange={setBomberoId} placeholderBusqueda="Buscar por codigo o nombre..." />
          </div>
          <div>
            <label htmlFor="motivo-opcional" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Motivo (opcional)</label>
            <input id="motivo-opcional" className="input-field" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          </div>
          <button type="button" className="btn-primary" onClick={agregar} disabled={!bomberoId}>Registrar pernocte</button>
        </div>
      )}
      {pernoctes && pernoctes.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin pernoctantes registrados.</p>}
      {pernoctes && pernoctes.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
            <th scope="col" style={{ padding: '6px 4px' }}>Bombero</th><th scope="col" style={{ padding: '6px 4px' }}>Motivo</th><th scope="col" style={{ padding: '6px 4px' }}>Observacion</th>
          </tr></thead>
          <tbody>{pernoctes.map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
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
      {error && <Aviso tipo="error" texto={error} />}
      {puedeEditar && (
        <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap' }}>
          <div>
            <label htmlFor="sector" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Sector</label>
            <select id="sector" className="input-field" value={sector} onChange={(e) => setSector(e.target.value)}>
              <option value="">-- seleccionar --</option>
              {sectores.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="estado-2" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado</label>
            <select id="estado-2" className="input-field" value={estado} onChange={(e) => setEstado(e.target.value as 'OK' | 'NO_OK')}>
              <option value="OK">OK</option>
              <option value="NO_OK">NO OK</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label htmlFor="observacion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observacion</label>
            <input id="observacion" className="input-field" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
          </div>
          <button type="button" className="btn-primary" onClick={agregar} disabled={!sector}>Registrar</button>
        </div>
      )}
      {inspecciones && inspecciones.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin inspecciones registradas.</p>}
      {inspecciones && inspecciones.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
            <th scope="col" style={{ padding: '6px 4px' }}>Sector</th><th scope="col" style={{ padding: '6px 4px' }}>Estado</th><th scope="col" style={{ padding: '6px 4px' }}>Observacion</th>
          </tr></thead>
          <tbody>{inspecciones.map((i) => (
            <tr key={i.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
              <td style={{ padding: '6px 4px' }}>{i.sectorNombre}</td>
              <td style={{ padding: '6px 4px' }}><span className="badge" style={{ background: i.estado === 'OK' ? 'var(--ok-fill)' : 'var(--bad-fill)' }}>{i.estado}</span></td>
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
      {error && <Aviso tipo="error" texto={error} />}
      {puedeEditar && (
        <div className="card" style={{ display: 'flex', gap: 10 }}>
          <input className="input-field" style={{ flex: 1 }} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Nueva novedad..." />
          <button type="button" className="btn-primary" onClick={agregar} disabled={!texto.trim()}>Agregar</button>
        </div>
      )}
      {novedades && novedades.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin novedades registradas.</p>}
      {novedades && novedades.length > 0 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {novedades.map((n) => (
            <div key={n.id} style={{ display: 'flex', gap: 10, fontSize: 13, borderBottom: '1px solid var(--line-soft)', paddingBottom: 8 }}>
              <span style={{ color: 'var(--muted)', minWidth: 140 }}>{new Date(n.fechaHora).toLocaleString()}</span>
              <span>{n.texto}{n.autorNombre ? ` — ${n.autorNombre}` : ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabMoviles({ guardiaId }: { guardiaId: string }) {
  const solicitarEntrada = useEntradaConfirmada();
  const [moviles, setMoviles] = useState<MovilARevisar[] | null>(null);
  const [inspecciones, setInspecciones] = useState<InspeccionMovil[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardandoId, setGuardandoId] = useState<string | null>(null);
  const [observacion, setObservacion] = useState('');

  const puedeEditar = !!obtenerSesion()?.usuario.permisos.includes('guardias:editar');

  async function cargar() {
    try {
      const [m, i] = await Promise.all([cargarMovilesARevisar(guardiaId), listarInspeccionesMovil(guardiaId)]);
      setMoviles(m);
      setInspecciones(i);
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guardiaId]);

  function inspeccionDe(vehiculoId: string, checklistItemId: string) {
    return (inspecciones ?? []).find((i) => i.vehiculoId === vehiculoId && i.checklistItemId === checklistItemId);
  }

  async function registrar(vehiculoId: string, checklistItemId: string, estado: 'OK' | 'NO_OK') {
    setError(null);
    setMensaje(null);
    const clave = `${vehiculoId}:${checklistItemId}`;
    setGuardandoId(clave);
    try {
      await crearInspeccionMovil(guardiaId, { vehiculoId, checklistItemId, estado, observacion: estado === 'NO_OK' ? observacion || undefined : undefined });
      setObservacion('');
      setMensaje('Registrado');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardandoId(null);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 13, color: 'var(--muted)' }}>
        Vehiculos y checklist recuperados automaticamente desde el modulo de Vehiculos/Equipos — Guardias solo
        consulta esa informacion, la administracion vive en sus propios modulos.
      </p>
      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {moviles && moviles.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>No hay vehiculos activos registrados en el modulo de Vehiculos.</p>}

      {moviles && moviles.map(({ vehiculo, checklistItems, equipos }) => (
        <div key={vehiculo.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <h3 style={{ fontSize: 14 }}>{vehiculo.numeroInterno} — {vehiculo.tipo}{vehiculo.patente ? ` (${vehiculo.patente})` : ''}</h3>
            <span className="badge">{vehiculo.estado}</span>
          </div>
          {equipos.length > 0 && (
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>Equipamiento asignado: {equipos.map((e) => e.nombre).join(', ')}</p>
          )}
          {checklistItems.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin items de checklist configurados para este tipo de vehiculo.</p>}
          {checklistItems.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                  <th scope="col" style={{ padding: '6px 4px' }}>Item</th>
                  <th scope="col" style={{ padding: '6px 4px' }}>Categoria</th>
                  <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
                  {puedeEditar && <th scope="col" style={{ padding: '6px 4px' }}>Registrar</th>}
                </tr>
              </thead>
              <tbody>
                {checklistItems.map((item) => {
                  const ya = inspeccionDe(vehiculo.id, item.id);
                  const clave = `${vehiculo.id}:${item.id}`;
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                      <td style={{ padding: '6px 4px' }}>{item.nombre}</td>
                      <td style={{ padding: '6px 4px' }}>{item.categoria}</td>
                      <td style={{ padding: '6px 4px' }}>
                        {ya ? (
                          <span className="badge" style={{ background: ya.estado === 'OK' ? 'var(--ok-fill)' : 'var(--bad-fill)' }}>
                            {ya.estado}{ya.observacion ? ` — ${ya.observacion}` : ''}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--muted)' }}>Sin verificar</span>
                        )}
                      </td>
                      {puedeEditar && (
                        <td style={{ padding: '6px 4px', display: 'flex', gap: 6 }}>
                          <button type="button"
                            className="btn-primary"
                            style={{ padding: '4px 8px', fontSize: 12, background: '#166534' }}
                            disabled={guardandoId === clave}
                            onClick={() => registrar(vehiculo.id, item.id, 'OK')}
                          >
                            OK
                          </button>
                          <button type="button"
                            className="btn-primary"
                            style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d' }}
                            disabled={guardandoId === clave}
                            onClick={async () => {
                              const obs = await solicitarEntrada({ titulo: 'Registrar ítem no conforme', mensaje: 'La observación es obligatoria para marcar NO OK.', etiqueta: 'Observación', confirmar: 'Registrar', peligro: true, requerida: true });
                              if (!obs || !obs.trim()) return;
                              setObservacion(obs.trim());
                              registrar(vehiculo.id, item.id, 'NO_OK');
                            }}
                          >
                            NO OK
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}

function TabBitacora({ guardiaId }: { guardiaId: string }) {
  const [bitacora, setBitacora] = useState<Bitacora | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarBitacora(guardiaId).then(setBitacora).catch((err) => setError(err.message));
  }, [guardiaId]);

  if (error) return <p style={{ color: 'var(--danger)' }}>{error}</p>;
  if (!bitacora) return <Cargando texto="Cargando bitacora…" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 13, color: 'var(--muted)' }}>
        SIGBO como concentrador: esta bitacora combina, sin duplicar, lo ya registrado en Asistencia, Servicios,
        Equipos y Eventos dentro del horario real de esta guardia, mas lo propio de Guardias.
      </p>

      <BitacoraSeccion titulo={`Marcaciones de asistencia (${bitacora.marcacionesAsistencia.length})`}>
        {bitacora.marcacionesAsistencia.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin marcaciones en el horario de la guardia.</p>}
        {bitacora.marcacionesAsistencia.map((m: any) => (
          <div key={m.id} style={{ fontSize: 13, display: 'flex', gap: 10, borderBottom: '1px solid var(--line-soft)', padding: '4px 0' }}>
            <span style={{ color: 'var(--muted)', minWidth: 160 }}>{new Date(m.timestampMarcacion).toLocaleString()}</span>
            <span className="badge">{m.tipoMarcacion}</span>
            <span>{m.nombreCompleto}</span>
          </div>
        ))}
      </BitacoraSeccion>

      <BitacoraSeccion titulo={`Servicios (${bitacora.servicios.length})`}>
        {bitacora.servicios.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin servicios en el horario de la guardia.</p>}
        {bitacora.servicios.map((s: any) => (
          <div key={s.id} style={{ fontSize: 13, display: 'flex', gap: 10, borderBottom: '1px solid var(--line-soft)', padding: '4px 0' }}>
            <span style={{ color: 'var(--muted)', minWidth: 160 }}>{new Date(s.fechaHoraAviso).toLocaleString()}</span>
            <span>{s.numeroServicio}</span>
            <span className="badge">{s.estado}</span>
          </div>
        ))}
      </BitacoraSeccion>

      <BitacoraSeccion titulo={`Eventos (${bitacora.eventos.length})`}>
        {bitacora.eventos.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin eventos en el horario de la guardia.</p>}
        {bitacora.eventos.map((e: any) => (
          <div key={e.id} style={{ fontSize: 13, display: 'flex', gap: 10, borderBottom: '1px solid var(--line-soft)', padding: '4px 0' }}>
            <span style={{ color: 'var(--muted)', minWidth: 160 }}>{new Date(e.fechaInicio).toLocaleString()}</span>
            <span>{e.nombre}</span>
          </div>
        ))}
      </BitacoraSeccion>

      <BitacoraSeccion titulo={`Prestamos de equipo (${bitacora.prestamosEquipo.length})`}>
        {bitacora.prestamosEquipo.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin prestamos en el horario de la guardia.</p>}
        {bitacora.prestamosEquipo.map((p: any) => (
          <div key={p.id} style={{ fontSize: 13, display: 'flex', gap: 10, borderBottom: '1px solid var(--line-soft)', padding: '4px 0' }}>
            <span style={{ color: 'var(--muted)', minWidth: 160 }}>{new Date(p.fechaPrestamo).toLocaleString()}</span>
            <span>{p.nombreCompleto ?? '—'}</span>
            <span className="badge">{p.estado}</span>
          </div>
        ))}
      </BitacoraSeccion>

      <BitacoraSeccion titulo={`Pernoctantes (${bitacora.pernoctes.length})`}>
        {bitacora.pernoctes.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin pernoctantes.</p>}
        {bitacora.pernoctes.map((p) => (
          <div key={p.id} style={{ fontSize: 13, borderBottom: '1px solid var(--line-soft)', padding: '4px 0' }}>
            {p.nombreCompleto}{p.motivo ? ` — ${p.motivo}` : ''}
          </div>
        ))}
      </BitacoraSeccion>

      <BitacoraSeccion titulo={`Novedades (${bitacora.novedades.length})`}>
        {bitacora.novedades.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin novedades.</p>}
        {bitacora.novedades.map((n) => (
          <div key={n.id} style={{ fontSize: 13, borderBottom: '1px solid var(--line-soft)', padding: '4px 0' }}>
            <span style={{ color: 'var(--muted)' }}>{new Date(n.fechaHora).toLocaleString()}</span> — {n.texto}
          </div>
        ))}
      </BitacoraSeccion>

      {bitacora.guardia.cierreResumen && (
        <div className="card">
          <h3 style={{ fontSize: 14, marginBottom: 10 }}>Resumen de cierre</h3>
          <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap', color: 'var(--muted)' }}>
            {formatearJsonSeguro(bitacora.guardia.cierreResumen)}
          </pre>
        </div>
      )}
    </div>
  );
}

function BitacoraSeccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <h3 style={{ fontSize: 14, marginBottom: 10 }}>{titulo}</h3>
      <div style={{ display: 'flex', flexDirection: 'column' }}>{children}</div>
    </div>
  );
}
