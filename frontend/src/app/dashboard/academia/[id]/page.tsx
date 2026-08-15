'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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
import { Parametro } from '@/lib/parametros';
import {
  ActividadAcademica,
  EvaluacionAcademica,
  InstructorDeActividad,
  InstructorExternoInput,
  NotaParticipante,
  ParticipanteDeActividad,
  ParticipanteExternoAcademiaInput,
  actualizarActividad,
  actualizarInscripcion,
  asignarInstructorBombero,
  asignarInstructorExterno,
  cargarActividad,
  cargarEvaluaciones,
  cargarInstructoresDeActividad,
  cargarModalidadesAcademicas,
  cargarNotas,
  cargarParticipantesDeActividad,
  cargarResultadosAcademicos,
  cargarSesionesDeActividad,
  cargarTiposActividadAcademica,
  cargarTiposEvaluacionAcademica,
  crearEvaluacion,
  crearSesion,
  generarReporteActividadDocx,
  generarReporteActividadPdf,
  inscribirBombero,
  inscribirExterno,
  quitarInstructor,
  quitarParticipante,
  registrarNota,
} from '@/lib/academia';
import { API_ORIGIN } from '@/lib/api';
import { EventoAsistencia, cargarTiposEvento } from '@/lib/asistencia';

const ESTADOS_ACTIVIDAD = ['PLANIFICADA', 'ABIERTA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA'];

const EXTERNO_VACIO: InstructorExternoInput = {
  nombre: '',
  apellido: '',
  documento: '',
  institucion: '',
  especialidad: '',
  telefono: '',
  email: '',
  observaciones: '',
};

const PARTICIPANTE_EXTERNO_VACIO: ParticipanteExternoAcademiaInput = {
  cedula: '',
  nombre: '',
  apellido: '',
  celular: '',
  institucionProcedencia: '',
  observacion: '',
};

const COLOR_ESTADO_INSCRIPCION: Record<string, string> = {
  INSCRITO: '#475569',
  ACTIVO: '#2563eb',
  RETIRADO: '#7f1d1d',
  FINALIZADO: '#15803d',
};

export default function DetalleActividadAcademicaPage() {
  const params = useParams();
  const router = useRouter();
  const actividadId = params.id as string;

  const [actividad, setActividad] = useState<ActividadAcademica | null>(null);
  const [instructores, setInstructores] = useState<InstructorDeActividad[] | null>(null);
  const [participantes, setParticipantes] = useState<ParticipanteDeActividad[] | null>(null);
  const [sesiones, setSesiones] = useState<EventoAsistencia[] | null>(null);
  const [tipos, setTipos] = useState<Parametro[]>([]);
  const [modalidades, setModalidades] = useState<Parametro[]>([]);
  const [resultados, setResultados] = useState<Parametro[]>([]);
  const [tiposEvento, setTiposEvento] = useState<Parametro[]>([]);
  const [bomberos, setBomberos] = useState<BomberoResumen[]>([]);
  const [tiposBombero, setTiposBombero] = useState<TipoBombero[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [mostrarFormSesion, setMostrarFormSesion] = useState(false);
  const [sesionNombre, setSesionNombre] = useState('');
  const [sesionInicio, setSesionInicio] = useState('');
  const [sesionFin, setSesionFin] = useState('');
  const [sesionTipoEventoId, setSesionTipoEventoId] = useState('');
  const [guardandoSesion, setGuardandoSesion] = useState(false);

  const [evaluaciones, setEvaluaciones] = useState<EvaluacionAcademica[] | null>(null);
  const [tiposEvaluacion, setTiposEvaluacion] = useState<Parametro[]>([]);
  const [mostrarFormEvaluacion, setMostrarFormEvaluacion] = useState(false);
  const [evalTipoId, setEvalTipoId] = useState('');
  const [evalTitulo, setEvalTitulo] = useState('');
  const [evalFecha, setEvalFecha] = useState('');
  const [guardandoEvaluacion, setGuardandoEvaluacion] = useState(false);
  const [evaluacionExpandida, setEvaluacionExpandida] = useState<string | null>(null);
  const [notas, setNotas] = useState<NotaParticipante[] | null>(null);
  const [cargandoNotas, setCargandoNotas] = useState(false);
  const [generandoReporte, setGenerandoReporte] = useState<'pdf' | 'docx' | null>(null);

  const [bomberoSeleccionado, setBomberoSeleccionado] = useState('');
  const [mostrarFormExterno, setMostrarFormExterno] = useState(false);
  const [externo, setExterno] = useState<InstructorExternoInput>(EXTERNO_VACIO);
  const [guardando, setGuardando] = useState(false);

  const [participanteSeleccionado, setParticipanteSeleccionado] = useState('');
  const [mostrarFormParticipanteExterno, setMostrarFormParticipanteExterno] = useState(false);
  const [participanteExterno, setParticipanteExterno] = useState<ParticipanteExternoAcademiaInput>(PARTICIPANTE_EXTERNO_VACIO);
  const [guardandoParticipante, setGuardandoParticipante] = useState(false);

  const puedeEditar = !!obtenerSesion()?.usuario.permisos.includes('academia:editar_curso');
  const puedeGestionarInstructores = !!obtenerSesion()?.usuario.permisos.includes('academia:gestionar_instructores');
  const puedeInscribir = !!obtenerSesion()?.usuario.permisos.includes('academia:inscribir');
  const puedeCalificar = !!obtenerSesion()?.usuario.permisos.includes('academia:calificar');
  const puedeRegistrarAsistencia = !!obtenerSesion()?.usuario.permisos.includes('academia:registrar_asistencia');

  const tipoPorId = useMemo(() => new Map(tipos.map((t) => [t.id, t.nombre])), [tipos]);
  const modalidadPorId = useMemo(() => new Map(modalidades.map((m) => [m.id, m.nombre])), [modalidades]);
  const tipoBomberoPorId = useMemo(() => construirTipoPorId(tiposBombero), [tiposBombero]);
  const opcionesResultado = useMemo(() => resultados.map((r) => ({ value: r.id, label: r.nombre })), [resultados]);
  const opcionesTipoEvento = useMemo(() => tiposEvento.map((t) => ({ value: t.id, label: t.nombre })), [tiposEvento]);
  const tipoEvaluacionPorId = useMemo(() => new Map(tiposEvaluacion.map((t) => [t.id, t.nombre])), [tiposEvaluacion]);

  const opcionesBombero = useMemo(() => {
    const yaAsignados = new Set((instructores ?? []).map((i) => i.bomberoId).filter(Boolean));
    const disponibles = bomberos.filter((b) => !yaAsignados.has(b.id));
    const ordenados = [...disponibles].sort((a, b) => compararBomberosInstitucional(a, b, tipoBomberoPorId));
    return ordenados.map((b) => ({ value: b.id, label: `${b.numeroBombero} — ${b.nombre} ${b.apellido}` }));
  }, [bomberos, instructores, tipoBomberoPorId]);

  const opcionesBomberoParticipante = useMemo(() => {
    const yaInscritos = new Set((participantes ?? []).map((p) => p.bomberoId).filter(Boolean));
    const disponibles = bomberos.filter((b) => !yaInscritos.has(b.id));
    const ordenados = [...disponibles].sort((a, b) => compararBomberosInstitucional(a, b, tipoBomberoPorId));
    return ordenados.map((b) => ({ value: b.id, label: `${b.numeroBombero} — ${b.nombre} ${b.apellido}` }));
  }, [bomberos, participantes, tipoBomberoPorId]);

  async function cargarTodo() {
    try {
      const [act, inst, part, ses, evals] = await Promise.all([
        cargarActividad(actividadId),
        cargarInstructoresDeActividad(actividadId),
        cargarParticipantesDeActividad(actividadId),
        cargarSesionesDeActividad(actividadId),
        cargarEvaluaciones(actividadId),
      ]);
      setActividad(act);
      setInstructores(inst);
      setParticipantes(part);
      setSesiones(ses);
      setEvaluaciones(evals);
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarTodo();
    cargarTiposActividadAcademica().then(setTipos);
    cargarModalidadesAcademicas().then(setModalidades);
    cargarResultadosAcademicos().then(setResultados);
    cargarTiposEvento().then(setTiposEvento);
    cargarTiposEvaluacionAcademica().then(setTiposEvaluacion);
    cargarBomberos().then(setBomberos).catch(() => undefined);
    cargarTiposBombero().then(setTiposBombero);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actividadId]);

  async function cambiarEstado(estado: string) {
    setError(null);
    try {
      await actualizarActividad(actividadId, { estado });
      await cargarTodo();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function agregarBombero() {
    if (!bomberoSeleccionado) return;
    setError(null);
    try {
      await asignarInstructorBombero(actividadId, bomberoSeleccionado);
      setBomberoSeleccionado('');
      await cargarTodo();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function agregarExternoForm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await asignarInstructorExterno(actividadId, {
        nombre: externo.nombre,
        apellido: externo.apellido || undefined,
        documento: externo.documento || undefined,
        institucion: externo.institucion || undefined,
        especialidad: externo.especialidad || undefined,
        telefono: externo.telefono || undefined,
        email: externo.email || undefined,
        observaciones: externo.observaciones || undefined,
      });
      setExterno(EXTERNO_VACIO);
      setMostrarFormExterno(false);
      await cargarTodo();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function quitar(instructorId: string) {
    if (!window.confirm('Quitar este instructor de la actividad?')) return;
    setError(null);
    try {
      await quitarInstructor(actividadId, instructorId);
      await cargarTodo();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function agregarParticipanteBombero() {
    if (!participanteSeleccionado) return;
    setError(null);
    try {
      await inscribirBombero(actividadId, participanteSeleccionado);
      setParticipanteSeleccionado('');
      await cargarTodo();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function agregarParticipanteExternoForm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardandoParticipante(true);
    try {
      await inscribirExterno(actividadId, {
        cedula: participanteExterno.cedula || undefined,
        nombre: participanteExterno.nombre,
        apellido: participanteExterno.apellido || undefined,
        celular: participanteExterno.celular || undefined,
        institucionProcedencia: participanteExterno.institucionProcedencia || undefined,
        observacion: participanteExterno.observacion || undefined,
      });
      setParticipanteExterno(PARTICIPANTE_EXTERNO_VACIO);
      setMostrarFormParticipanteExterno(false);
      await cargarTodo();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardandoParticipante(false);
    }
  }

  async function cambiarEstadoInscripcion(inscripcionId: string, estado: string) {
    setError(null);
    try {
      await actualizarInscripcion(actividadId, inscripcionId, { estado });
      await cargarTodo();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function cambiarResultadoInscripcion(inscripcionId: string, resultadoFinalId: string) {
    setError(null);
    try {
      await actualizarInscripcion(actividadId, inscripcionId, { resultadoFinalId: resultadoFinalId || undefined });
      await cargarTodo();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function quitarParticipanteDeActividad(inscripcionId: string) {
    if (!window.confirm('Quitar este participante de la actividad?')) return;
    setError(null);
    try {
      await quitarParticipante(actividadId, inscripcionId);
      await cargarTodo();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function crearSesionForm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardandoSesion(true);
    try {
      await crearSesion(actividadId, {
        nombre: sesionNombre || undefined,
        fechaInicio: sesionInicio,
        fechaFin: sesionFin,
        tipoEventoId: sesionTipoEventoId || undefined,
        inscribirParticipantesActuales: true,
      });
      setSesionNombre('');
      setSesionInicio('');
      setSesionFin('');
      setSesionTipoEventoId('');
      setMostrarFormSesion(false);
      await cargarTodo();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardandoSesion(false);
    }
  }

  async function crearEvaluacionForm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardandoEvaluacion(true);
    try {
      await crearEvaluacion(actividadId, {
        tipoEvaluacionId: evalTipoId,
        titulo: evalTitulo || undefined,
        fecha: evalFecha || undefined,
      });
      setEvalTipoId('');
      setEvalTitulo('');
      setEvalFecha('');
      setMostrarFormEvaluacion(false);
      await cargarTodo();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardandoEvaluacion(false);
    }
  }

  async function abrirNotas(evaluacionId: string) {
    if (evaluacionExpandida === evaluacionId) {
      setEvaluacionExpandida(null);
      setNotas(null);
      return;
    }
    setEvaluacionExpandida(evaluacionId);
    setCargandoNotas(true);
    setError(null);
    try {
      setNotas(await cargarNotas(evaluacionId));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargandoNotas(false);
    }
  }

  async function generarReporte(formato: 'pdf' | 'docx') {
    setError(null);
    setGenerandoReporte(formato);
    try {
      const { url } = formato === 'pdf' ? await generarReporteActividadPdf(actividadId) : await generarReporteActividadDocx(actividadId);
      window.open(`${API_ORIGIN}${url}`, '_blank');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerandoReporte(null);
    }
  }

  async function guardarNota(evaluacionId: string, inscripcionId: string, cambios: { calificacion?: number; resultadoId?: string }) {
    setError(null);
    try {
      await registrarNota(evaluacionId, inscripcionId, {
        ...cambios,
        resultadoId: cambios.resultadoId === '' ? undefined : cambios.resultadoId,
      });
      setNotas(await cargarNotas(evaluacionId));
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (error && !actividad) return <p style={{ color: '#f87171' }}>{error}</p>;
  if (!actividad) return <p style={{ color: '#94a3b8' }}>Cargando actividad...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: 18 }}>
              {actividad.nombre}
              {actividad.codigo && <span style={{ color: '#94a3b8', fontSize: 14 }}> ({actividad.codigo})</span>}
            </h2>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <span className="badge">{tipoPorId.get(actividad.tipoActividadId) ?? '-'}</span>
              {actividad.modalidadId && <span className="badge">{modalidadPorId.get(actividad.modalidadId) ?? '-'}</span>}
              {actividad.esExterna && <span className="badge" style={{ background: '#475569' }}>externa</span>}
              {puedeEditar ? (
                <select
                  className="input-field"
                  style={{ padding: '2px 8px', fontSize: 11, width: 'auto' }}
                  value={actividad.estado}
                  onChange={(e) => cambiarEstado(e.target.value)}
                >
                  {ESTADOS_ACTIVIDAD.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="badge">{actividad.estado}</span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" style={{ background: '#475569' }} onClick={() => generarReporte('pdf')} disabled={generandoReporte !== null}>
              {generandoReporte === 'pdf' ? 'Generando...' : 'Reporte PDF'}
            </button>
            <button className="btn-primary" style={{ background: '#475569' }} onClick={() => generarReporte('docx')} disabled={generandoReporte !== null}>
              {generandoReporte === 'docx' ? 'Generando...' : 'Reporte DOCX'}
            </button>
            <button className="btn-primary" style={{ background: '#475569' }} onClick={() => router.push('/dashboard/academia')}>
              Volver
            </button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginTop: 16 }}>
          <div>
            <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>Inicio</span>
            <span style={{ fontSize: 13 }}>{actividad.fechaInicio}</span>
          </div>
          <div>
            <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>Fin</span>
            <span style={{ fontSize: 13 }}>{actividad.fechaFin}</span>
          </div>
          <div>
            <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>Lugar</span>
            <span style={{ fontSize: 13 }}>{actividad.lugar ?? '-'}</span>
          </div>
          <div>
            <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>Carga horaria</span>
            <span style={{ fontSize: 13 }}>{actividad.duracionHoras ? `${actividad.duracionHoras} hs` : '-'}</span>
          </div>
        </div>
        {actividad.descripcion && (
          <p style={{ fontSize: 13, color: '#cbd5e1', marginTop: 12 }}>{actividad.descripcion}</p>
        )}
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      {puedeGestionarInstructores && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ fontSize: 14 }}>Agregar instructor</h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap' }}>
            <div style={{ minWidth: 280 }}>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Personal (bombero)</label>
              <ComboBuscable
                opciones={opcionesBombero}
                value={bomberoSeleccionado}
                onChange={setBomberoSeleccionado}
                placeholderBusqueda="Buscar por codigo o nombre..."
              />
            </div>
            <button className="btn-primary" onClick={agregarBombero} disabled={!bomberoSeleccionado}>
              Agregar personal
            </button>
            <button
              type="button"
              className="btn-primary"
              style={{ background: '#475569' }}
              onClick={() => setMostrarFormExterno(!mostrarFormExterno)}
            >
              {mostrarFormExterno ? 'Cancelar' : '+ Instructor externo'}
            </button>
          </div>

          {mostrarFormExterno && (
            <form onSubmit={agregarExternoForm} style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid #334155', paddingTop: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
                  <input className="input-field" value={externo.nombre} onChange={(e) => setExterno({ ...externo, nombre: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Apellido</label>
                  <input className="input-field" value={externo.apellido} onChange={(e) => setExterno({ ...externo, apellido: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Documento</label>
                  <input className="input-field" value={externo.documento} onChange={(e) => setExterno({ ...externo, documento: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Institución</label>
                  <input className="input-field" value={externo.institucion} onChange={(e) => setExterno({ ...externo, institucion: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Especialidad</label>
                  <input className="input-field" value={externo.especialidad} onChange={(e) => setExterno({ ...externo, especialidad: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Teléfono</label>
                  <input className="input-field" value={externo.telefono} onChange={(e) => setExterno({ ...externo, telefono: e.target.value })} />
                </div>
              </div>
              <button className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Agregar externo'}
              </button>
            </form>
          )}
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: 14, marginBottom: 10 }}>Instructores ({instructores?.length ?? 0})</h3>
        {instructores && instructores.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin instructores asignados.</p>}
        {instructores && instructores.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '6px 4px' }}>Nombre</th>
                <th style={{ padding: '6px 4px' }}>Tipo</th>
                <th style={{ padding: '6px 4px' }}>Rol</th>
                <th style={{ padding: '6px 4px' }}>Detalle</th>
                {puedeGestionarInstructores && <th style={{ padding: '6px 4px' }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {instructores.map((i) => (
                <tr key={i.id} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '6px 4px' }}>
                    {i.nombreCompleto}
                    {i.numeroBombero ? ` (${i.numeroBombero})` : ''}
                  </td>
                  <td style={{ padding: '6px 4px' }}>{i.tipo === 'PERSONAL' ? 'Personal' : 'Externo'}</td>
                  <td style={{ padding: '6px 4px' }}>{i.rolInstructor}</td>
                  <td style={{ padding: '6px 4px', color: '#94a3b8' }}>
                    {i.tipo === 'PERSONAL' ? i.rango ?? '-' : [i.institucion, i.especialidad].filter(Boolean).join(' — ') || '-'}
                  </td>
                  {puedeGestionarInstructores && (
                    <td style={{ padding: '6px 4px' }}>
                      <button
                        className="btn-primary"
                        style={{ padding: '4px 8px', fontSize: 11, background: '#7f1d1d' }}
                        onClick={() => quitar(i.id)}
                      >
                        Quitar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {puedeInscribir && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ fontSize: 14 }}>Inscribir participante</h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap' }}>
            <div style={{ minWidth: 280 }}>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Personal (bombero)</label>
              <ComboBuscable
                opciones={opcionesBomberoParticipante}
                value={participanteSeleccionado}
                onChange={setParticipanteSeleccionado}
                placeholderBusqueda="Buscar por codigo o nombre..."
              />
            </div>
            <button className="btn-primary" onClick={agregarParticipanteBombero} disabled={!participanteSeleccionado}>
              Inscribir personal
            </button>
            <button
              type="button"
              className="btn-primary"
              style={{ background: '#475569' }}
              onClick={() => setMostrarFormParticipanteExterno(!mostrarFormParticipanteExterno)}
            >
              {mostrarFormParticipanteExterno ? 'Cancelar' : '+ Participante externo'}
            </button>
          </div>

          {mostrarFormParticipanteExterno && (
            <form
              onSubmit={agregarParticipanteExternoForm}
              style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid #334155', paddingTop: 10 }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
                  <input
                    className="input-field"
                    value={participanteExterno.nombre}
                    onChange={(e) => setParticipanteExterno({ ...participanteExterno, nombre: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Apellido</label>
                  <input
                    className="input-field"
                    value={participanteExterno.apellido}
                    onChange={(e) => setParticipanteExterno({ ...participanteExterno, apellido: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cédula</label>
                  <input
                    className="input-field"
                    value={participanteExterno.cedula}
                    onChange={(e) => setParticipanteExterno({ ...participanteExterno, cedula: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Institución de procedencia</label>
                  <input
                    className="input-field"
                    value={participanteExterno.institucionProcedencia}
                    onChange={(e) => setParticipanteExterno({ ...participanteExterno, institucionProcedencia: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Celular</label>
                  <input
                    className="input-field"
                    value={participanteExterno.celular}
                    onChange={(e) => setParticipanteExterno({ ...participanteExterno, celular: e.target.value })}
                  />
                </div>
              </div>
              <button className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardandoParticipante}>
                {guardandoParticipante ? 'Guardando...' : 'Inscribir externo'}
              </button>
            </form>
          )}
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: 14, marginBottom: 10 }}>Participantes ({participantes?.length ?? 0})</h3>
        {participantes && participantes.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin participantes inscritos.</p>}
        {participantes && participantes.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '6px 4px' }}>Nombre</th>
                <th style={{ padding: '6px 4px' }}>Tipo</th>
                <th style={{ padding: '6px 4px' }}>Inscripción</th>
                <th style={{ padding: '6px 4px' }}>Estado</th>
                <th style={{ padding: '6px 4px' }}>Resultado final</th>
                {puedeInscribir && <th style={{ padding: '6px 4px' }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {participantes.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '6px 4px' }}>
                    {p.nombreCompleto}
                    {p.numeroBombero ? ` (${p.numeroBombero})` : ''}
                  </td>
                  <td style={{ padding: '6px 4px' }}>{p.tipo === 'PERSONAL' ? 'Personal' : 'Externo'}</td>
                  <td style={{ padding: '6px 4px', color: '#94a3b8' }}>{p.fechaInscripcion}</td>
                  <td style={{ padding: '6px 4px' }}>
                    {puedeCalificar ? (
                      <select
                        className="input-field"
                        style={{ padding: '2px 6px', fontSize: 11, width: 'auto', background: COLOR_ESTADO_INSCRIPCION[p.estado] }}
                        value={p.estado}
                        onChange={(e) => cambiarEstadoInscripcion(p.id, e.target.value)}
                      >
                        {['INSCRITO', 'ACTIVO', 'RETIRADO', 'FINALIZADO'].map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="badge" style={{ background: COLOR_ESTADO_INSCRIPCION[p.estado] }}>
                        {p.estado}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    {puedeCalificar ? (
                      <ComboBuscable
                        opciones={opcionesResultado}
                        value={p.resultadoFinalId ?? ''}
                        onChange={(v) => cambiarResultadoInscripcion(p.id, v)}
                        ningunaLabel="Sin definir"
                        maxWidth={180}
                      />
                    ) : (
                      (p.resultadoFinal ?? '-')
                    )}
                  </td>
                  {puedeInscribir && (
                    <td style={{ padding: '6px 4px' }}>
                      <button
                        className="btn-primary"
                        style={{ padding: '4px 8px', fontSize: 11, background: '#7f1d1d' }}
                        onClick={() => quitarParticipanteDeActividad(p.id)}
                      >
                        Quitar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {puedeRegistrarAsistencia && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 14 }}>Sesiones ({sesiones?.length ?? 0})</h3>
            <button className="btn-primary" onClick={() => setMostrarFormSesion(!mostrarFormSesion)}>
              {mostrarFormSesion ? 'Cancelar' : '+ Nueva sesión'}
            </button>
          </div>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>
            Cada sesión es una jornada de asistencia enlazada a esta actividad. Los ya inscritos se agregan automáticamente
            como participantes de la sesión; la asistencia (marcaciones, participación completa/parcial) se gestiona desde
            Asistencia → Eventos.
          </p>

          {mostrarFormSesion && (
            <form onSubmit={crearSesionForm} style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid #334155', paddingTop: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre (opcional)</label>
                  <input className="input-field" value={sesionNombre} onChange={(e) => setSesionNombre(e.target.value)} placeholder={actividad.nombre} />
                </div>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Inicio</label>
                  <input className="input-field" type="datetime-local" value={sesionInicio} onChange={(e) => setSesionInicio(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fin</label>
                  <input className="input-field" type="datetime-local" value={sesionFin} onChange={(e) => setSesionFin(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo de evento</label>
                  <ComboBuscable opciones={opcionesTipoEvento} value={sesionTipoEventoId} onChange={setSesionTipoEventoId} ningunaLabel="Sin definir" />
                </div>
              </div>
              <button className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardandoSesion}>
                {guardandoSesion ? 'Guardando...' : 'Crear sesión'}
              </button>
            </form>
          )}

          {sesiones && sesiones.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin sesiones registradas.</p>}
          {sesiones && sesiones.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
                  <th style={{ padding: '6px 4px' }}>Nombre</th>
                  <th style={{ padding: '6px 4px' }}>Inicio</th>
                  <th style={{ padding: '6px 4px' }}>Fin</th>
                  <th style={{ padding: '6px 4px' }}>Estado</th>
                  <th style={{ padding: '6px 4px' }}>Asistencia</th>
                </tr>
              </thead>
              <tbody>
                {sesiones.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #1f2937' }}>
                    <td style={{ padding: '6px 4px' }}>{s.nombre}</td>
                    <td style={{ padding: '6px 4px', color: '#94a3b8' }}>{new Date(s.fechaInicio).toLocaleString('es-PY')}</td>
                    <td style={{ padding: '6px 4px', color: '#94a3b8' }}>{new Date(s.fechaFin).toLocaleString('es-PY')}</td>
                    <td style={{ padding: '6px 4px' }}>
                      <span className="badge">{s.estado}</span>
                    </td>
                    <td style={{ padding: '6px 4px' }}>
                      <Link href={`/dashboard/asistencia/eventos/${s.id}`} style={{ color: '#60a5fa', fontSize: 12 }}>
                        Gestionar asistencia →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {puedeCalificar && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 14 }}>Evaluaciones ({evaluaciones?.length ?? 0})</h3>
            <button className="btn-primary" onClick={() => setMostrarFormEvaluacion(!mostrarFormEvaluacion)}>
              {mostrarFormEvaluacion ? 'Cancelar' : '+ Nueva evaluación'}
            </button>
          </div>

          {mostrarFormEvaluacion && (
            <form onSubmit={crearEvaluacionForm} style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid #334155', paddingTop: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo de evaluación</label>
                  <ComboBuscable opciones={tiposEvaluacion.map((t) => ({ value: t.id, label: t.nombre }))} value={evalTipoId} onChange={setEvalTipoId} />
                </div>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Título (opcional)</label>
                  <input className="input-field" value={evalTitulo} onChange={(e) => setEvalTitulo(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha</label>
                  <input className="input-field" type="date" value={evalFecha} onChange={(e) => setEvalFecha(e.target.value)} />
                </div>
              </div>
              <button className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardandoEvaluacion || !evalTipoId}>
                {guardandoEvaluacion ? 'Guardando...' : 'Crear evaluación'}
              </button>
            </form>
          )}

          {evaluaciones && evaluaciones.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin evaluaciones registradas.</p>}
          {evaluaciones && evaluaciones.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {evaluaciones.map((ev) => (
                <div key={ev.id} style={{ border: '1px solid #334155', borderRadius: 6, padding: 10 }}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => abrirNotas(ev.id)}
                  >
                    <div>
                      <span className="badge">{tipoEvaluacionPorId.get(ev.tipoEvaluacionId) ?? '-'}</span>
                      <span style={{ marginLeft: 8, fontSize: 13 }}>{ev.titulo ?? '(sin título)'}</span>
                      {ev.fecha && <span style={{ marginLeft: 8, fontSize: 12, color: '#94a3b8' }}>{ev.fecha}</span>}
                    </div>
                    <span style={{ fontSize: 12, color: '#60a5fa' }}>{evaluacionExpandida === ev.id ? 'Ocultar notas ▲' : 'Ver/cargar notas ▼'}</span>
                  </div>

                  {evaluacionExpandida === ev.id && (
                    <div style={{ marginTop: 10, borderTop: '1px solid #1f2937', paddingTop: 10 }}>
                      {cargandoNotas && <p style={{ color: '#94a3b8', fontSize: 12 }}>Cargando notas...</p>}
                      {!cargandoNotas && notas && notas.length === 0 && (
                        <p style={{ color: '#94a3b8', fontSize: 12 }}>No hay participantes inscritos en esta actividad.</p>
                      )}
                      {!cargandoNotas && notas && notas.length > 0 && (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                          <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
                              <th style={{ padding: '4px' }}>Participante</th>
                              <th style={{ padding: '4px' }}>Calificación</th>
                              <th style={{ padding: '4px' }}>Resultado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {notas.map((n) => (
                              <tr key={n.inscripcionId} style={{ borderBottom: '1px solid #1f2937' }}>
                                <td style={{ padding: '4px' }}>
                                  {n.nombreCompleto}
                                  {n.numeroBombero ? ` (${n.numeroBombero})` : ''}
                                </td>
                                <td style={{ padding: '4px' }}>
                                  <input
                                    className="input-field"
                                    type="number"
                                    step="0.01"
                                    style={{ width: 80, padding: '2px 6px' }}
                                    defaultValue={n.calificacion ?? ''}
                                    onBlur={(e) => {
                                      const valor = e.target.value === '' ? undefined : Number(e.target.value);
                                      if (valor !== undefined) guardarNota(ev.id, n.inscripcionId, { calificacion: valor });
                                    }}
                                  />
                                </td>
                                <td style={{ padding: '4px' }}>
                                  <ComboBuscable
                                    opciones={opcionesResultado}
                                    value={n.resultadoId ?? ''}
                                    onChange={(v) => guardarNota(ev.id, n.inscripcionId, { resultadoId: v })}
                                    ningunaLabel="Sin definir"
                                    maxWidth={160}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
