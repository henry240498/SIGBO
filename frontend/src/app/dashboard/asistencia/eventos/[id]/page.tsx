'use client';

import { useEffect, useMemo, useState } from 'react';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
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
import {
  agregarParticipanteBombero,
  agregarParticipanteExterno,
  calcularDesdeMarcaciones,
  cargarEvento,
  cargarParticipantes,
  cargarTiposEvento,
  ESTADOS_PARTICIPACION,
  EventoAsistencia,
  ParticipanteEvento,
  actualizarParticipacion,
  quitarParticipante,
} from '@/lib/asistencia';
import { Parametro } from '@/lib/parametros';
import { Cargando } from '@/app/components/Cargando';
import { Aviso } from '@/app/components/Aviso';

const COLOR_ESTADO: Record<string, string> = {
  COMPLETA: 'var(--ok-fill)',
  PARCIAL: 'var(--warn-fill)',
  NO_REGISTRADA: 'var(--neutral-fill)',
  AUSENTE_CONFIRMADO: 'var(--bad-fill)',
};

export default function DetalleEventoPage() {
  const confirmar = useConfirmacion();
  const params = useParams();
  const router = useRouter();
  const eventoId = params.id as string;

  const [evento, setEvento] = useState<EventoAsistencia | null>(null);
  const [participantes, setParticipantes] = useState<ParticipanteEvento[] | null>(null);
  const [tiposEvento, setTiposEvento] = useState<Parametro[]>([]);
  const [bomberos, setBomberos] = useState<BomberoResumen[]>([]);
  const [tiposBombero, setTiposBombero] = useState<TipoBombero[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [bomberoSeleccionado, setBomberoSeleccionado] = useState('');
  const [mostrarFormExterno, setMostrarFormExterno] = useState(false);
  const [externo, setExterno] = useState({ cedula: '', nombre: '', apellido: '', celular: '', institucionProcedencia: '', observacion: '' });
  const [guardando, setGuardando] = useState(false);

  const puedeEditar = !!obtenerSesion()?.usuario.permisos.includes('asistencia:eventos_editar');

  const tipoBomberoPorId = useMemo(() => construirTipoPorId(tiposBombero), [tiposBombero]);
  const tipoEventoPorId = useMemo(() => new Map(tiposEvento.map((t) => [t.id, t.nombre])), [tiposEvento]);

  const opcionesBombero = useMemo(() => {
    const yaParticipan = new Set((participantes ?? []).map((p) => p.bomberoId).filter(Boolean));
    const disponibles = bomberos.filter((b) => !yaParticipan.has(b.id));
    const ordenados = [...disponibles].sort((a, b) => compararBomberosInstitucional(a, b, tipoBomberoPorId));
    return ordenados.map((b) => ({ value: b.id, label: `${b.numeroBombero} — ${b.nombre} ${b.apellido}` }));
  }, [bomberos, participantes, tipoBomberoPorId]);

  async function cargarTodo() {
    try {
      const [ev, parts] = await Promise.all([cargarEvento(eventoId), cargarParticipantes(eventoId)]);
      setEvento(ev);
      setParticipantes(parts);
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarTodo();
    cargarTiposEvento().then(setTiposEvento);
    cargarBomberos().then(setBomberos).catch(() => undefined);
    cargarTiposBombero().then(setTiposBombero);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventoId]);

  async function agregarBombero() {
    if (!bomberoSeleccionado) return;
    setError(null);
    try {
      await agregarParticipanteBombero(eventoId, bomberoSeleccionado);
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
      await agregarParticipanteExterno(eventoId, {
        cedula: externo.cedula || undefined,
        nombre: externo.nombre,
        apellido: externo.apellido || undefined,
        celular: externo.celular || undefined,
        institucionProcedencia: externo.institucionProcedencia || undefined,
        observacion: externo.observacion || undefined,
      });
      setExterno({ cedula: '', nombre: '', apellido: '', celular: '', institucionProcedencia: '', observacion: '' });
      setMostrarFormExterno(false);
      await cargarTodo();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function marcarEstado(participanteId: string, estado: string) {
    setError(null);
    try {
      await actualizarParticipacion(eventoId, participanteId, { estadoParticipacion: estado });
      await cargarTodo();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function calcularDesde(participanteId: string) {
    setError(null);
    setMensaje(null);
    try {
      await calcularDesdeMarcaciones(eventoId, participanteId);
      setMensaje('Participacion calculada a partir de las marcaciones de entrada/salida');
      await cargarTodo();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function quitar(participanteId: string) {
    if (!await confirmar({ titulo: 'Confirmar acción', mensaje: 'Quitar a esta persona del evento?', confirmar: 'Continuar', peligro: true })) return;
    setError(null);
    try {
      await quitarParticipante(eventoId, participanteId);
      await cargarTodo();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (error && !evento) return <p style={{ color: 'var(--danger)' }}>{error}</p>;
  if (!evento) return <Cargando texto="Cargando evento…" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: 18 }}>{evento.nombre}</h2>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <span className="badge">{evento.tipoEventoId ? tipoEventoPorId.get(evento.tipoEventoId) ?? '-' : '-'}</span>
              <span className="badge">{evento.estado}</span>
            </div>
          </div>
          <button type="button" className="btn-primary" style={{ background: '#475569' }} onClick={() => router.push('/dashboard/asistencia/eventos')}>
            Volver
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 16 }}>
          <div>
            <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block' }}>Inicio</span>
            <span style={{ fontSize: 13 }}>{new Date(evento.fechaInicio).toLocaleString()}</span>
          </div>
          <div>
            <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block' }}>Fin</span>
            <span style={{ fontSize: 13 }}>{new Date(evento.fechaFin).toLocaleString()}</span>
          </div>
          <div>
            <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block' }}>Ubicacion</span>
            <span style={{ fontSize: 13 }}>{evento.ubicacion ?? '-'}</span>
          </div>
        </div>
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {puedeEditar && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ fontSize: 14 }}>Agregar participante</h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap' }}>
            <div style={{ minWidth: 280 }}>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Personal (bombero)</label>
              <ComboBuscable ariaLabel="Personal (bombero)"
                opciones={opcionesBombero}
                value={bomberoSeleccionado}
                onChange={setBomberoSeleccionado}
                placeholderBusqueda="Buscar por codigo o nombre..."
              />
            </div>
            <button type="button" className="btn-primary" onClick={agregarBombero} disabled={!bomberoSeleccionado}>
              Agregar personal
            </button>
            <button
              type="button"
              className="btn-primary"
              style={{ background: '#475569' }}
              onClick={() => setMostrarFormExterno(!mostrarFormExterno)}
            >
              {mostrarFormExterno ? 'Cancelar' : '+ Participante externo'}
            </button>
          </div>

          {mostrarFormExterno && (
            <form onSubmit={agregarExternoForm} style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--line)', paddingTop: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label htmlFor="cedula" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cedula</label>
                  <input id="cedula" className="input-field" value={externo.cedula} onChange={(e) => setExterno({ ...externo, cedula: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="nombre" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
                  <input id="nombre" className="input-field" value={externo.nombre} onChange={(e) => setExterno({ ...externo, nombre: e.target.value })} required />
                </div>
                <div>
                  <label htmlFor="apellido" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Apellido</label>
                  <input id="apellido" className="input-field" value={externo.apellido} onChange={(e) => setExterno({ ...externo, apellido: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="celular" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Celular</label>
                  <input id="celular" className="input-field" value={externo.celular} onChange={(e) => setExterno({ ...externo, celular: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="institucion-de-procedencia" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Institucion de procedencia</label>
                  <input id="institucion-de-procedencia"
                    className="input-field"
                    value={externo.institucionProcedencia}
                    onChange={(e) => setExterno({ ...externo, institucionProcedencia: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="observacion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observacion</label>
                  <input id="observacion" className="input-field" value={externo.observacion} onChange={(e) => setExterno({ ...externo, observacion: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Agregar externo'}
              </button>
            </form>
          )}
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: 14, marginBottom: 10 }}>Participantes ({participantes?.length ?? 0})</h3>
        {participantes && participantes.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin participantes agregados.</p>}
        {participantes && participantes.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                <th scope="col" style={{ padding: '6px 4px' }}>Nombre</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Tipo</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Presencia</th>
                <th scope="col" style={{ padding: '6px 4px' }}>%</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
                {puedeEditar && <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {participantes.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                  <td style={{ padding: '6px 4px' }}>
                    {p.nombreCompleto}
                    {p.codigoBombero ? ` (${p.codigoBombero})` : ''}
                  </td>
                  <td style={{ padding: '6px 4px' }}>{p.tipoParticipante === 'PERSONAL' ? 'Personal' : 'Externo'}</td>
                  <td style={{ padding: '6px 4px' }}>
                    {p.horaRealInicio ? new Date(p.horaRealInicio).toLocaleTimeString() : '-'} -{' '}
                    {p.horaRealFin ? new Date(p.horaRealFin).toLocaleTimeString() : '-'}
                  </td>
                  <td style={{ padding: '6px 4px' }}>{p.porcentajeParticipacion ?? '-'}</td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge" style={{ background: COLOR_ESTADO[p.estadoParticipacion] ?? 'var(--neutral-fill)' }}>
                      {p.estadoParticipacion}
                    </span>
                  </td>
                  {puedeEditar && (
                    <td style={{ padding: '6px 4px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {p.tipoParticipante === 'PERSONAL' && (
                        <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => calcularDesde(p.id)}>
                          Calcular desde marcaciones
                        </button>
                      )}
                      <select
                        className="input-field"
                        style={{ padding: '4px 8px', fontSize: 11, width: 'auto' }}
                        value={p.estadoParticipacion}
                        onChange={(e) => marcarEstado(p.id, e.target.value)}
                      >
                        {ESTADOS_PARTICIPACION.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
                      <button type="button"
                        className="btn-primary"
                        style={{ padding: '4px 8px', fontSize: 11, background: '#7f1d1d' }}
                        onClick={() => quitar(p.id)}
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
    </div>
  );
}
