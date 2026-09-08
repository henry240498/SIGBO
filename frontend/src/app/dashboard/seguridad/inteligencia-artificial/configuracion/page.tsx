'use client';

import { useEffect, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { AvatarIa } from '@/components/AvatarIa';
import {
  AVATARES_PREDEFINIDOS,
  ConfiguracionIa,
  EstadoConfiguracionIa,
  EstadoOllama,
  EstadoPiper,
  EstadoWhisper,
  HistorialConfiguracionIa,
  VozPiperDisponible,
  actualizarConfiguracionIa,
  cambiarEstadoIa,
  cargarConfiguracionIa,
  cargarEstadoOllama,
  cargarEstadoPiper,
  cargarEstadoWhisper,
  cargarVocesPiper,
  cargarHistorialConfiguracionIa,
  eliminarIaDefinitivamente,
  probarConexionOllama,
  probarGeneracionOllama,
  probarPiper,
  seleccionarAvatarPredefinidoIa,
  subirAvatarIa,
} from '@/lib/ia';
import { Cargando } from '@/app/components/Cargando';
import { Aviso } from '@/app/components/Aviso';

const MODULOS_DISPONIBLES = [
  { slug: 'personal', label: 'Personal' },
  { slug: 'organizacion', label: 'Organización' },
  { slug: 'guardias', label: 'Guardias' },
  { slug: 'asistencia', label: 'Asistencia' },
  { slug: 'servicios', label: 'Servicios' },
  { slug: 'vehiculos', label: 'Vehículos' },
  { slug: 'equipos', label: 'Equipos' },
  { slug: 'academia', label: 'Academia' },
  { slug: 'deposito', label: 'Depósito' },
  { slug: 'finanzas', label: 'Finanzas' },
  { slug: 'documentos', label: 'Documentos' },
];

const FORMALIDADES = [
  { value: 'BAJA', label: 'Baja (informal y cercano)' },
  { value: 'MEDIA', label: 'Media (cordial)' },
  { value: 'ALTA', label: 'Alta (formal e institucional)' },
];

function formatearFechaHora(iso: string) {
  return new Date(iso).toLocaleString('es-PY');
}

function SelectorAvatarIa({ config, onCambiado }: { config: ConfiguracionIa; onCambiado: () => void }) {
  const [tab, setTab] = useState<'sugeridos' | 'subir'>('sugeridos');
  const [error, setError] = useState<string | null>(null);
  const [aplicando, setAplicando] = useState(false);

  async function elegirPredefinido(emoji: string, colorFondo: string) {
    setError(null);
    setAplicando(true);
    try {
      await seleccionarAvatarPredefinidoIa(emoji, colorFondo);
      onCambiado();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAplicando(false);
    }
  }

  async function subirImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setError(null);
    setAplicando(true);
    try {
      await subirAvatarIa(archivo);
      onCambiado();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAplicando(false);
      e.target.value = '';
    }
  }

  function estiloTab(activo: boolean): React.CSSProperties {
    return {
      padding: '8px 14px',
      fontSize: 12,
      background: 'transparent',
      border: 'none',
      borderBottom: activo ? '2px solid #2563eb' : '2px solid transparent',
      color: activo ? 'var(--ink)' : 'var(--muted)',
      fontWeight: activo ? 600 : 400,
      cursor: 'pointer',
    };
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <AvatarIa avatarUrl={config.avatarUrl} avatarEmoji={config.avatarEmoji} avatarColorFondo={config.avatarColorFondo} nombre={config.nombre} size={72} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Avatar actual</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{config.avatarUrl ? 'Imagen subida' : config.avatarEmoji ? 'Avatar predefinido' : 'Sin avatar (emoji por defecto)'}</div>
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--line)' }}>
        <button type="button" onClick={() => setTab('sugeridos')} style={estiloTab(tab === 'sugeridos')}>Avatares sugeridos</button>
        <button type="button" onClick={() => setTab('subir')} style={estiloTab(tab === 'subir')}>Subir imagen</button>
      </div>

      {error && <Aviso tipo="error" texto={error} fontSize={12} />}
      {aplicando && <p style={{ color: 'var(--muted)', fontSize: 12 }}>Aplicando...</p>}

      {tab === 'sugeridos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 10 }}>
          {AVATARES_PREDEFINIDOS.map((a) => {
            const seleccionado = config.avatarEmoji === a.emoji && config.avatarColorFondo === a.colorFondo;
            return (
              <button
                key={`${a.emoji}-${a.colorFondo}`}
                type="button"
                onClick={() => elegirPredefinido(a.emoji, a.colorFondo)}
                disabled={aplicando}
                title={a.etiqueta}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  background: 'transparent',
                  border: seleccionado ? '2px solid #2563eb' : '2px solid transparent',
                  borderRadius: 10,
                  padding: 6,
                  cursor: aplicando ? 'default' : 'pointer',
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: a.colorFondo, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{a.emoji}</div>
                <span style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'center' }}>{a.etiqueta}</span>
              </button>
            );
          })}
        </div>
      )}

      {tab === 'subir' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={subirImagen} disabled={aplicando} />
          <div style={{ background: 'var(--surface-soft)', border: '1px solid var(--line)', borderRadius: 8, padding: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Requisitos de la imagen</p>
            <ul style={{ fontSize: 12, color: 'var(--muted)', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4, margin: 0 }}>
              <li>Formato: PNG (recomendado), JPG o WEBP.</li>
              <li>Para que el personaje se vea &quot;flotando&quot; sin fondo, tiene que ser un <strong>PNG con fondo transparente</strong> — JPG no soporta transparencia.</li>
              <li>Tamaño máximo del archivo: 10 MB.</li>
              <li>Resolución sugerida: hasta 1500×1500px — no hace falta más, se muestra escalada.</li>
              <li>El personaje debe estar centrado y ocupar la mayor parte de la imagen (sin márgenes grandes vacíos).</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function formatearBytes(bytes: number) {
  const gb = bytes / 1e9;
  return gb >= 1 ? `${gb.toFixed(2)} GB` : `${(bytes / 1e6).toFixed(0)} MB`;
}

/** Panel técnico de Ollama (Configuración → Inteligencia Artificial →
 * Snoopy → Motor local): estado de conexión, inventario de modelos
 * instalados y pruebas a demanda. Separado del resto del formulario
 * porque su estado se refresca contra Ollama en vivo, no contra
 * ConfiguracionIa. */
function PanelOllama({ modeloSeleccionado, onSeleccionarModelo }: { modeloSeleccionado: string; onSeleccionarModelo: (modelo: string) => void }) {
  const [estado, setEstado] = useState<EstadoOllama | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [probando, setProbando] = useState<'conexion' | 'generacion' | null>(null);
  const [resultadoPrueba, setResultadoPrueba] = useState<string | null>(null);

  async function refrescar() {
    setCargando(true);
    setError(null);
    try {
      setEstado(await cargarEstadoOllama());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void refrescar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function conexion() {
    setProbando('conexion');
    setResultadoPrueba(null);
    try {
      const r = await probarConexionOllama();
      setResultadoPrueba(r.conectado ? `Conectado — versión ${r.version}.` : `Sin conexión: ${r.error}`);
    } catch (err: any) {
      setResultadoPrueba(`Error: ${err.message}`);
    } finally {
      setProbando(null);
    }
  }

  async function generacion() {
    setProbando('generacion');
    setResultadoPrueba(null);
    try {
      const r = await probarGeneracionOllama();
      setResultadoPrueba(r.ok ? `Respuesta (${r.duracionMs} ms): "${r.respuesta}"` : `Falló: ${r.error}`);
    } catch (err: any) {
      setResultadoPrueba(`Error: ${err.message}`);
    } finally {
      setProbando(null);
    }
  }

  return (
    <div className="card" style={{ background: 'var(--surface-soft)', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: 13 }}>Estado de Ollama</strong>
        <button type="button" className="service-secondary" onClick={() => void refrescar()} disabled={cargando}>{cargando ? 'Consultando...' : 'Actualizar'}</button>
      </div>
      {error && <p className="form-error">{error}</p>}
      {estado && (
        <>
          <p style={{ fontSize: 13 }}>
            <span className="badge" style={{ background: estado.conectado ? 'var(--ok-fill)' : 'var(--bad-fill)', marginRight: 8 }}>{estado.conectado ? 'Conectado' : 'No disponible'}</span>
            {estado.url}
            {estado.error && !estado.conectado && <span style={{ color: 'var(--muted)' }}> — {estado.error}</span>}
          </p>
          {estado.conectado && (
            <p style={{ fontSize: 12, color: estado.modeloDisponible ? 'var(--success)' : 'var(--danger)' }}>
              Modelo configurado: {estado.modeloConfigurado ?? '(ninguno seleccionado)'} — {estado.modeloConfigurado ? (estado.modeloDisponible ? 'disponible' : 'NO está instalado') : 'elegí uno de la lista'}
            </p>
          )}
          {estado.modelosInstalados.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                  <th scope="col" style={{ padding: '4px' }}>Modelo</th>
                  <th scope="col" style={{ padding: '4px' }}>Tamaño</th>
                  <th scope="col" style={{ padding: '4px' }}>Activo</th>
                </tr>
              </thead>
              <tbody>
                {estado.modelosInstalados.map((m) => (
                  <tr key={m.nombre} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                    <td style={{ padding: '4px' }}>{m.nombre}</td>
                    <td style={{ padding: '4px' }}>{formatearBytes(m.tamanoBytes)}</td>
                    <td style={{ padding: '4px' }}>
                      {modeloSeleccionado === m.nombre ? (
                        <span className="badge" style={{ background: 'var(--ok-fill)' }}>Seleccionado</span>
                      ) : (
                        <button type="button" className="service-secondary" style={{ padding: '2px 8px', fontSize: 11 }} onClick={() => onSeleccionarModelo(m.nombre)}>Usar este</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : estado.conectado ? (
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>Ollama está corriendo pero no tiene ningún modelo instalado (<code>ollama pull &lt;modelo&gt;</code>).</p>
          ) : null}
        </>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="service-secondary" disabled={probando !== null} onClick={() => void conexion()}>{probando === 'conexion' ? 'Probando...' : 'Probar conexión'}</button>
        <button type="button" className="service-secondary" disabled={probando !== null || !estado?.modeloDisponible} onClick={() => void generacion()}>{probando === 'generacion' ? 'Generando...' : 'Probar generación'}</button>
      </div>
      {resultadoPrueba && <p style={{ fontSize: 12, color: 'var(--muted)' }}>{resultadoPrueba}</p>}
    </div>
  );
}

/** Panel técnico de voz (Configuración → Inteligencia Artificial → Snoopy
 * → Voz local, Etapa 2): estado de whisper.cpp (conectividad HTTP) y Piper
 * (archivos en disco), más una prueba real que reproduce el audio
 * generado -- mismo criterio que "Probar generación" de Ollama: el admin
 * escucha el resultado, no solo un booleano. */
function PanelVoz() {
  const [estadoWhisper, setEstadoWhisper] = useState<EstadoWhisper | null>(null);
  const [estadoPiper, setEstadoPiper] = useState<EstadoPiper | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [probando, setProbando] = useState(false);
  const [resultadoPrueba, setResultadoPrueba] = useState<string | null>(null);

  async function refrescar() {
    setCargando(true);
    setError(null);
    try {
      const [w, p] = await Promise.all([cargarEstadoWhisper(), cargarEstadoPiper()]);
      setEstadoWhisper(w);
      setEstadoPiper(p);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void refrescar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function probar() {
    setProbando(true);
    setResultadoPrueba(null);
    try {
      const blob = await probarPiper();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
      setResultadoPrueba('Reproduciendo...');
    } catch (err: any) {
      setResultadoPrueba(`Falló: ${err.message}`);
    } finally {
      setProbando(false);
    }
  }

  return (
    <div className="card" style={{ background: 'var(--surface-soft)', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: 13 }}>Estado de voz</strong>
        <button type="button" className="service-secondary" onClick={() => void refrescar()} disabled={cargando}>{cargando ? 'Consultando...' : 'Actualizar'}</button>
      </div>
      {error && <p className="form-error">{error}</p>}
      {estadoWhisper && (
        <p style={{ fontSize: 13 }}>
          <span className="badge" style={{ background: estadoWhisper.conectado ? 'var(--ok-fill)' : 'var(--bad-fill)', marginRight: 8 }}>{estadoWhisper.conectado ? 'Conectado' : 'No disponible'}</span>
          whisper.cpp (entrada por voz) — {estadoWhisper.url}
          {estadoWhisper.error && !estadoWhisper.conectado && <span style={{ color: 'var(--muted)' }}> — {estadoWhisper.error}</span>}
        </p>
      )}
      {estadoPiper && (
        <p style={{ fontSize: 13 }}>
          <span className="badge" style={{ background: estadoPiper.disponible ? 'var(--ok-fill)' : 'var(--bad-fill)', marginRight: 8 }}>{estadoPiper.disponible ? 'Disponible' : 'No disponible'}</span>
          Piper (respuesta por voz)
          {estadoPiper.error && !estadoPiper.disponible && <span style={{ color: 'var(--muted)' }}> — {estadoPiper.error}</span>}
        </p>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="service-secondary" disabled={probando || !estadoPiper?.disponible} onClick={() => void probar()}>{probando ? 'Generando...' : 'Probar voz'}</button>
      </div>
      {resultadoPrueba && <p style={{ fontSize: 12, color: 'var(--muted)' }}>{resultadoPrueba}</p>}
    </div>
  );
}

function ZonaPeligro({ onEliminado }: { onEliminado: () => void }) {
  const [abierto, setAbierto] = useState(false);
  const [confirmacion, setConfirmacion] = useState('');
  const [motivo, setMotivo] = useState('');
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumen, setResumen] = useState<Record<string, number> | null>(null);

  async function eliminar() {
    setError(null);
    setEliminando(true);
    try {
      const res = await eliminarIaDefinitivamente(confirmacion, motivo || undefined);
      setResumen(res.resumen);
      onEliminado();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEliminando(false);
    }
  }

  if (resumen) {
    return (
      <div className="card" style={{ borderColor: 'var(--bad-fill)' }}>
        <h3 style={{ fontSize: 14, color: 'var(--danger)' }}>IA eliminada definitivamente</h3>
        <p style={{ fontSize: 13, marginTop: 8 }}>
          Se borraron {resumen.conversaciones} conversaciones, {resumen.mensajes} mensajes, {resumen.ejecucionesHerramientas} ejecuciones de herramientas,{' '}
          {resumen.cambiosDeConfiguracion} cambios de configuración y {resumen.propuestasDeMejora} propuestas de mejora.
        </p>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
          Queda un registro permanente de todo esto en Seguridad → Auditoría (nunca se borra). Si volvés a usar el chat o esta pantalla, se crea una configuración nueva desde cero.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ borderColor: 'var(--bad-fill)' }}>
      <h3 style={{ fontSize: 14, color: 'var(--danger)' }}>Zona de peligro</h3>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
        Eliminar la IA borra definitivamente toda conversación, mensaje, ejecución de herramienta, historial de configuración y propuesta de mejora. Antes de borrar nada, se
        deja un registro permanente en Seguridad → Auditoría con todo lo que hizo la IA desde su creación. Esta acción no se puede deshacer.
      </p>
      {!abierto && (
        <button type="button" className="btn-primary" style={{ background: '#7f1d1d', marginTop: 10 }} onClick={() => setAbierto(true)}>
          Eliminar IA
        </button>
      )}
      {abierto && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
          {error && <Aviso tipo="error" texto={error} fontSize={13} />}
          <input className="input-field" placeholder="Motivo (opcional, queda en el registro permanente)" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          <div>
            <label htmlFor="escribi-delete-para-confirmar" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              Escribí <strong>DELETE</strong> para confirmar
            </label>
            <input id="escribi-delete-para-confirmar" className="input-field" value={confirmacion} onChange={(e) => setConfirmacion(e.target.value)} placeholder="DELETE" />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn-primary" style={{ background: '#475569' }} onClick={() => setAbierto(false)}>Cancelar</button>
            <button type="button" className="btn-primary" style={{ background: '#7f1d1d' }} disabled={confirmacion !== 'DELETE' || eliminando} onClick={eliminar}>
              {eliminando ? 'Eliminando...' : 'Confirmar borrado definitivo'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConfiguracionIaPage() {
  const [config, setConfig] = useState<ConfiguracionIa | null>(null);
  const [historial, setHistorial] = useState<HistorialConfiguracionIa[] | null>(null);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [nombre, setNombre] = useState('');
  const [personaje, setPersonaje] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [personalidad, setPersonalidad] = useState('');
  const [saludo, setSaludo] = useState('');
  const [formalidad, setFormalidad] = useState('MEDIA');
  const [permiteEmojis, setPermiteEmojis] = useState(true);
  const [instrucciones, setInstrucciones] = useState('');
  const [limiteActivo, setLimiteActivo] = useState(false);
  const [limiteMinuto, setLimiteMinuto] = useState('8');
  const [limiteHora, setLimiteHora] = useState('60');
  const [modulosHabilitados, setModulosHabilitados] = useState<string[]>([]);
  const [explicarInterpretacion, setExplicarInterpretacion] = useState(false);
  const [motivo, setMotivo] = useState('');

  const [motivoEstado, setMotivoEstado] = useState('');
  const [mensajeMantenimiento, setMensajeMantenimiento] = useState('');

  const [ollamaHabilitado, setOllamaHabilitado] = useState(false);
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost');
  const [ollamaPuerto, setOllamaPuerto] = useState('11434');
  const [ollamaModelo, setOllamaModelo] = useState('');
  const [ollamaTimeoutMs, setOllamaTimeoutMs] = useState('8000');
  const [ollamaTemperatura, setOllamaTemperatura] = useState('0.3');

  const [vozHabilitada, setVozHabilitada] = useState(false);
  const [entradaVozHabilitada, setEntradaVozHabilitada] = useState(true);
  const [respuestaVozHabilitada, setRespuestaVozHabilitada] = useState(true);
  const [vozVolumen, setVozVolumen] = useState('1');
  const [vozVelocidad, setVozVelocidad] = useState('1');
  const [vozSeleccionada, setVozSeleccionada] = useState('');
  const [vozIdioma, setVozIdioma] = useState('es');
  const [whisperUrl, setWhisperUrl] = useState('http://localhost');
  const [whisperPuerto, setWhisperPuerto] = useState('8090');
  const [whisperTimeoutMs, setWhisperTimeoutMs] = useState('15000');
  const [piperRutaBinario, setPiperRutaBinario] = useState('');
  const [piperRutaVoz, setPiperRutaVoz] = useState('');
  const [piperTimeoutMs, setPiperTimeoutMs] = useState('15000');
  const [vocesDisponibles, setVocesDisponibles] = useState<VozPiperDisponible[]>([]);

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeDesactivar = permisos.includes('inteligencia:desactivar');
  const puedeEliminar = permisos.includes('inteligencia:eliminar');

  async function cargar() {
    try {
      const c = await cargarConfiguracionIa();
      setConfig(c);
      setNombre(c.nombre);
      setPersonaje(c.personaje ?? '');
      setDescripcion(c.descripcion ?? '');
      setPersonalidad(c.personalidad ?? '');
      setSaludo(c.saludo ?? '');
      setFormalidad(c.formalidad);
      setPermiteEmojis(c.permiteEmojis);
      setInstrucciones(c.instruccionesInstitucionales ?? '');
      setLimiteActivo(c.limiteActivo);
      setLimiteMinuto(String(c.limiteConsultasMinuto));
      setLimiteHora(String(c.limiteConsultasHora));
      setMensajeMantenimiento(c.mensajeMantenimiento ?? '');
      setExplicarInterpretacion(c.explicarInterpretacion);
      setOllamaHabilitado(c.ollamaHabilitado);
      setOllamaUrl(c.ollamaUrl);
      setOllamaPuerto(String(c.ollamaPuerto));
      setOllamaModelo(c.ollamaModelo ?? '');
      setOllamaTimeoutMs(String(c.ollamaTimeoutMs));
      setOllamaTemperatura(String(c.ollamaTemperatura));
      setVozHabilitada(c.vozHabilitada);
      setEntradaVozHabilitada(c.entradaVozHabilitada);
      setRespuestaVozHabilitada(c.respuestaVozHabilitada);
      setVozVolumen(String(c.vozVolumen));
      setVozVelocidad(String(c.vozVelocidad));
      setVozSeleccionada(c.vozSeleccionada ?? '');
      setVozIdioma(c.vozIdioma);
      setWhisperUrl(c.whisperUrl);
      setWhisperPuerto(String(c.whisperPuerto));
      setWhisperTimeoutMs(String(c.whisperTimeoutMs));
      setPiperRutaBinario(c.piperRutaBinario ?? '');
      setPiperRutaVoz(c.piperRutaVoz ?? '');
      setPiperTimeoutMs(String(c.piperTimeoutMs));
      try {
        setModulosHabilitados(JSON.parse(c.modulosHabilitadosJson));
      } catch {
        setModulosHabilitados([]);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // Voces reales instaladas en disco (Cierre de Snoopy) -- si Piper no
    // esta instalado o la carpeta no existe, la lista queda vacia y el
    // combo lo dice explicitamente en vez de fallar la pantalla entera.
    cargarVocesPiper()
      .then(setVocesDisponibles)
      .catch(() => setVocesDisponibles([]));
  }, []);

  function alternarModulo(slug: string) {
    setModulosHabilitados((prev) => (prev.includes(slug) ? prev.filter((m) => m !== slug) : [...prev, slug]));
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await actualizarConfiguracionIa({
        nombre,
        personaje: personaje || undefined,
        descripcion: descripcion || undefined,
        personalidad: personalidad || undefined,
        saludo: saludo || undefined,
        formalidad,
        permiteEmojis,
        instruccionesInstitucionales: instrucciones || undefined,
        limiteActivo,
        limiteConsultasMinuto: Number(limiteMinuto),
        limiteConsultasHora: Number(limiteHora),
        modulosHabilitados,
        explicarInterpretacion,
        ollamaHabilitado,
        ollamaUrl,
        ollamaPuerto: Number(ollamaPuerto),
        ollamaModelo: ollamaModelo || undefined,
        ollamaTimeoutMs: Number(ollamaTimeoutMs),
        ollamaTemperatura: Number(ollamaTemperatura),
        vozHabilitada,
        entradaVozHabilitada,
        respuestaVozHabilitada,
        vozVolumen: Number(vozVolumen),
        vozVelocidad: Number(vozVelocidad),
        vozSeleccionada: vozSeleccionada || undefined,
        vozIdioma,
        whisperUrl,
        whisperPuerto: Number(whisperPuerto),
        whisperTimeoutMs: Number(whisperTimeoutMs),
        piperRutaBinario: piperRutaBinario || undefined,
        piperRutaVoz: piperRutaVoz || undefined,
        piperTimeoutMs: Number(piperTimeoutMs),
        motivo: motivo || undefined,
      });
      setMensaje('Configuración actualizada.');
      setMotivo('');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function aplicarEstado(estado: EstadoConfiguracionIa) {
    setError(null);
    setMensaje(null);
    try {
      await cambiarEstadoIa(estado, motivoEstado || undefined, estado === 'MANTENIMIENTO' ? mensajeMantenimiento || undefined : undefined);
      setMensaje(`Estado cambiado a ${estado}.`);
      setMotivoEstado('');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function abrirHistorial() {
    setMostrarHistorial(!mostrarHistorial);
    if (!historial) {
      try {
        setHistorial(await cargarHistorialConfiguracionIa());
      } catch (err: any) {
        setError(err.message);
      }
    }
  }

  if (error && !config) return <p style={{ color: 'var(--danger)' }}>{error}</p>;
  if (!config) return <Cargando texto="Cargando configuración…" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {puedeDesactivar && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 14 }}>Estado del asistente</h3>
            <span className="badge" style={{ background: config.estado === 'ACTIVA' ? 'var(--ok-fill)' : config.estado === 'MANTENIMIENTO' ? 'var(--warn-fill)' : 'var(--bad-fill)' }}>{config.estado}</span>
          </div>
          <input className="input-field" placeholder="Motivo (queda registrado en el historial)" value={motivoEstado} onChange={(e) => setMotivoEstado(e.target.value)} />
          {config.estado !== 'MANTENIMIENTO' && (
            <input className="input-field" placeholder="Mensaje a mostrar en mantenimiento (opcional)" value={mensajeMantenimiento} onChange={(e) => setMensajeMantenimiento(e.target.value)} />
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            {config.estado !== 'ACTIVA' && <button type="button" className="btn-primary" onClick={() => aplicarEstado('ACTIVA')}>Activar</button>}
            {config.estado !== 'MANTENIMIENTO' && <button type="button" className="btn-primary" style={{ background: '#451a03' }} onClick={() => aplicarEstado('MANTENIMIENTO')}>Modo mantenimiento</button>}
            {config.estado !== 'INACTIVA' && <button type="button" className="btn-primary" style={{ background: '#7f1d1d' }} onClick={() => aplicarEstado('INACTIVA')}>Desactivar (emergencia)</button>}
          </div>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: 14, marginBottom: 12 }}>Avatar</h3>
        <SelectorAvatarIa config={config} onCambiado={cargar} />
      </div>

      <form onSubmit={guardar} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 style={{ fontSize: 14 }}>Identidad</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label htmlFor="nombre" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
            <input id="nombre" className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="personaje" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Personaje</label>
            <input id="personaje" className="input-field" value={personaje} onChange={(e) => setPersonaje(e.target.value)} placeholder="ej. Mascota del Cuartel" />
          </div>
        </div>
        <div>
          <label htmlFor="descripcion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descripción</label>
          <input id="descripcion" className="input-field" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </div>
        <div>
          <label htmlFor="personalidad" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Personalidad</label>
          <textarea id="personalidad" className="input-field" rows={3} value={personalidad} onChange={(e) => setPersonalidad(e.target.value)} />
        </div>
        <div>
          <label htmlFor="saludo" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Saludo</label>
          <input id="saludo" className="input-field" value={saludo} onChange={(e) => setSaludo(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Formalidad</label>
            <ComboBuscable ariaLabel="Formalidad" opciones={FORMALIDADES} value={formalidad} onChange={setFormalidad} ningunaLabel="Media" />
          </div>
          <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, marginTop: 20 }}>
            <input type="checkbox" checked={permiteEmojis} onChange={(e) => setPermiteEmojis(e.target.checked)} />
            Permitir emojis
          </label>
        </div>
        <div>
          <label htmlFor="instrucciones-institucionales-adicionale" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Instrucciones institucionales adicionales</label>
          <textarea id="instrucciones-institucionales-adicionale" className="input-field" rows={3} value={instrucciones} onChange={(e) => setInstrucciones(e.target.value)} placeholder="Reglas o contexto propio de esta institución para el asistente" />
        </div>
        <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={explicarInterpretacion} onChange={(e) => setExplicarInterpretacion(e.target.checked)} />
          Explicar interpretación (antepone a cada respuesta cómo se entendió la consulta — módulo, intención y filtros detectados)
        </label>

        <h3 style={{ fontSize: 14, marginTop: 6 }}>Límites de uso</h3>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>
          Motor de razonamiento local: sin proveedor externo, sin costo por consulta. El límite es solo una protección técnica opcional contra un uso abusivo puntual — apagado
          por defecto ("sin límites").
        </p>
        <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={limiteActivo} onChange={(e) => setLimiteActivo(e.target.checked)} />
          Activar límite de consultas por usuario
        </label>
        {limiteActivo && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="limite-por-minuto" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Límite por minuto</label>
              <input id="limite-por-minuto" className="input-field" type="number" min={1} value={limiteMinuto} onChange={(e) => setLimiteMinuto(e.target.value)} />
            </div>
            <div>
              <label htmlFor="limite-por-hora" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Límite por hora</label>
              <input id="limite-por-hora" className="input-field" type="number" min={1} value={limiteHora} onChange={(e) => setLimiteHora(e.target.value)} />
            </div>
          </div>
        )}

        <h3 style={{ fontSize: 14, marginTop: 6 }}>Motor local (Ollama)</h3>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>
          Infraestructura interna — para quien usa el asistente, sigue existiendo únicamente {config?.nombre || 'Snoopy'}. Ollama solo (a) sugiere qué consultar cuando el
          reconocimiento habitual no encuentra nada, y (b) redacta en lenguaje más natural un resultado que el sistema ya calculó y ya autorizó. Nunca decide qué datos se
          entregan ni consulta la base directamente. Apagado por defecto.
        </p>
        <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={ollamaHabilitado} onChange={(e) => setOllamaHabilitado(e.target.checked)} />
          Activar motor local Ollama
        </label>
        {ollamaHabilitado && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="ollama-url" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>URL</label>
              <input id="ollama-url" className="input-field" value={ollamaUrl} onChange={(e) => setOllamaUrl(e.target.value)} placeholder="http://localhost" />
            </div>
            <div>
              <label htmlFor="ollama-puerto" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Puerto</label>
              <input id="ollama-puerto" className="input-field" type="number" value={ollamaPuerto} onChange={(e) => setOllamaPuerto(e.target.value)} />
            </div>
            <div>
              <label htmlFor="ollama-timeout" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Timeout (ms)</label>
              <input id="ollama-timeout" className="input-field" type="number" min={500} max={120000} value={ollamaTimeoutMs} onChange={(e) => setOllamaTimeoutMs(e.target.value)} />
            </div>
            <div>
              <label htmlFor="ollama-temperatura" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Temperatura (0–1)</label>
              <input id="ollama-temperatura" className="input-field" type="number" min={0} max={1} step={0.05} value={ollamaTemperatura} onChange={(e) => setOllamaTemperatura(e.target.value)} />
            </div>
          </div>
        )}
        {ollamaHabilitado && <PanelOllama modeloSeleccionado={ollamaModelo} onSeleccionarModelo={setOllamaModelo} />}

        <h3 style={{ fontSize: 14, marginTop: 6 }}>Voz local (Etapa 2)</h3>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>
          Igual de local que Ollama: whisper.cpp transcribe lo que el usuario habla (nunca sale de esta red) y Piper convierte la respuesta de {config?.nombre || 'Snoopy'} en
          audio. Ninguno de los dos decide qué datos se entregan — solo convierten audio↔texto alrededor del mismo chat de siempre. Apagado por defecto.
        </p>
        <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={vozHabilitada} onChange={(e) => setVozHabilitada(e.target.checked)} />
          Activar voz
        </label>
        {vozHabilitada && (
          <>
            <div style={{ display: 'flex', gap: 16 }}>
              <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={entradaVozHabilitada} onChange={(e) => setEntradaVozHabilitada(e.target.checked)} />
                Entrada por voz (micrófono)
              </label>
              <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={respuestaVozHabilitada} onChange={(e) => setRespuestaVozHabilitada(e.target.checked)} />
                Respuesta por voz (altavoz)
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              <div>
                <label htmlFor="voz-volumen" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Volumen (0–1)</label>
                <input id="voz-volumen" className="input-field" type="number" min={0} max={1} step={0.1} value={vozVolumen} onChange={(e) => setVozVolumen(e.target.value)} />
              </div>
              <div>
                <label htmlFor="voz-velocidad" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Velocidad (0.5–2)</label>
                <input id="voz-velocidad" className="input-field" type="number" min={0.5} max={2} step={0.1} value={vozVelocidad} onChange={(e) => setVozVelocidad(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Voz (Piper)</label>
                <ComboBuscable
                  ariaLabel="Voz (Piper)"
                  opciones={vocesDisponibles.map((v) => ({ value: v.archivo.replace(/\.onnx$/i, ''), label: v.etiqueta }))}
                  value={vozSeleccionada}
                  onChange={(value) => {
                    setVozSeleccionada(value);
                    const voz = vocesDisponibles.find((v) => v.archivo.replace(/\.onnx$/i, '') === value);
                    if (voz) setPiperRutaVoz(voz.ruta);
                  }}
                  ningunaLabel={vocesDisponibles.length === 0 ? 'Sin voces instaladas' : 'Elegir voz...'}
                  disabled={vocesDisponibles.length === 0}
                />
                {vocesDisponibles.length <= 1 && (
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                    {vocesDisponibles.length === 0
                      ? 'No se encontró ninguna voz instalada en la carpeta configurada.'
                      : 'Solo hay 1 voz instalada. Para tener más opciones, agregá archivos .onnx de Piper a la misma carpeta.'}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="voz-idioma" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Idioma</label>
                <input id="voz-idioma" className="input-field" value={vozIdioma} onChange={(e) => setVozIdioma(e.target.value)} placeholder="es" />
              </div>
            </div>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Configuración técnica (solo si hace falta cambiar dónde corren whisper.cpp/Piper):</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <div>
                <label htmlFor="whisper-url" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>URL whisper.cpp</label>
                <input id="whisper-url" className="input-field" value={whisperUrl} onChange={(e) => setWhisperUrl(e.target.value)} />
              </div>
              <div>
                <label htmlFor="whisper-puerto" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Puerto whisper.cpp</label>
                <input id="whisper-puerto" className="input-field" type="number" value={whisperPuerto} onChange={(e) => setWhisperPuerto(e.target.value)} />
              </div>
              <div>
                <label htmlFor="whisper-timeout" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Timeout whisper.cpp (ms)</label>
                <input id="whisper-timeout" className="input-field" type="number" min={500} max={120000} value={whisperTimeoutMs} onChange={(e) => setWhisperTimeoutMs(e.target.value)} />
              </div>
              <div>
                <label htmlFor="piper-ruta-binario" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Ruta piper.exe</label>
                <input id="piper-ruta-binario" className="input-field" value={piperRutaBinario} onChange={(e) => setPiperRutaBinario(e.target.value)} />
              </div>
              <div>
                <label htmlFor="piper-ruta-voz" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Ruta del archivo de voz (.onnx)</label>
                <input id="piper-ruta-voz" className="input-field" value={piperRutaVoz} onChange={(e) => setPiperRutaVoz(e.target.value)} />
              </div>
              <div>
                <label htmlFor="piper-timeout" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Timeout Piper (ms)</label>
                <input id="piper-timeout" className="input-field" type="number" min={500} max={120000} value={piperTimeoutMs} onChange={(e) => setPiperTimeoutMs(e.target.value)} />
              </div>
            </div>
            <PanelVoz />
          </>
        )}

        <h3 style={{ fontSize: 14, marginTop: 6 }}>Módulos consultables</h3>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>Restricción institucional adicional: aunque un usuario tenga permiso, el asistente solo usa herramientas de los módulos marcados aquí.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
          {MODULOS_DISPONIBLES.map((m) => (
            <label key={m.slug} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={modulosHabilitados.includes(m.slug)} onChange={() => alternarModulo(m.slug)} />
              {m.label}
            </label>
          ))}
        </div>

        <div>
          <label htmlFor="motivo-del-cambio-queda-en-el-historial" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Motivo del cambio (queda en el historial)</label>
          <input id="motivo-del-cambio-queda-en-el-historial" className="input-field" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        </div>

        <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar configuración'}
        </button>
      </form>

      <div className="card">
        <button type="button" className="btn-primary" style={{ background: '#334155' }} onClick={abrirHistorial}>
          {mostrarHistorial ? 'Ocultar historial' : 'Ver historial de cambios'}
        </button>
        {mostrarHistorial && historial && (
          <div style={{ marginTop: 12 }}>
            {historial.length === 0 && <p style={{ fontSize: 13, color: 'var(--muted)' }}>Sin cambios registrados.</p>}
            {historial.map((h) => (
              <div key={h.id} style={{ fontSize: 12, padding: '8px 0', borderBottom: '1px solid var(--line-soft)' }}>
                <div style={{ color: 'var(--muted)' }}>{formatearFechaHora(h.creadoEn)} {h.ip ? `— ${h.ip}` : ''}</div>
                {h.motivo && <div style={{ marginTop: 2 }}>Motivo: {h.motivo}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {puedeEliminar && <ZonaPeligro onEliminado={cargar} />}
    </div>
  );
}
