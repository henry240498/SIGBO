'use client';

import { useEffect, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { AvatarIa } from '@/components/AvatarIa';
import {
  AVATARES_PREDEFINIDOS,
  ConfiguracionIa,
  EstadoConfiguracionIa,
  HistorialConfiguracionIa,
  actualizarConfiguracionIa,
  cambiarEstadoIa,
  cargarConfiguracionIa,
  cargarHistorialConfiguracionIa,
  eliminarIaDefinitivamente,
  seleccionarAvatarPredefinidoIa,
  subirAvatarIa,
} from '@/lib/ia';

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
      color: activo ? '#e2e8f0' : '#94a3b8',
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
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{config.avatarUrl ? 'Imagen subida' : config.avatarEmoji ? 'Avatar predefinido' : 'Sin avatar (emoji por defecto)'}</div>
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #334155' }}>
        <button type="button" onClick={() => setTab('sugeridos')} style={estiloTab(tab === 'sugeridos')}>Avatares sugeridos</button>
        <button type="button" onClick={() => setTab('subir')} style={estiloTab(tab === 'subir')}>Subir imagen</button>
      </div>

      {error && <p style={{ color: '#f87171', fontSize: 12 }}>{error}</p>}
      {aplicando && <p style={{ color: '#94a3b8', fontSize: 12 }}>Aplicando...</p>}

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
                <span style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center' }}>{a.etiqueta}</span>
              </button>
            );
          })}
        </div>
      )}

      {tab === 'subir' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={subirImagen} disabled={aplicando} />
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Requisitos de la imagen</p>
            <ul style={{ fontSize: 12, color: '#94a3b8', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4, margin: 0 }}>
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
      <div className="card" style={{ borderColor: '#7f1d1d' }}>
        <h3 style={{ fontSize: 14, color: '#f87171' }}>IA eliminada definitivamente</h3>
        <p style={{ fontSize: 13, marginTop: 8 }}>
          Se borraron {resumen.conversaciones} conversaciones, {resumen.mensajes} mensajes, {resumen.ejecucionesHerramientas} ejecuciones de herramientas,{' '}
          {resumen.cambiosDeConfiguracion} cambios de configuración y {resumen.propuestasDeMejora} propuestas de mejora.
        </p>
        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
          Queda un registro permanente de todo esto en Seguridad → Auditoría (nunca se borra). Si volvés a usar el chat o esta pantalla, se crea una configuración nueva desde cero.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ borderColor: '#7f1d1d' }}>
      <h3 style={{ fontSize: 14, color: '#f87171' }}>Zona de peligro</h3>
      <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
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
          {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}
          <input className="input-field" placeholder="Motivo (opcional, queda en el registro permanente)" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              Escribí <strong>DELETE</strong> para confirmar
            </label>
            <input className="input-field" value={confirmacion} onChange={(e) => setConfirmacion(e.target.value)} placeholder="DELETE" />
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

  if (error && !config) return <p style={{ color: '#f87171' }}>{error}</p>;
  if (!config) return <p style={{ color: '#94a3b8' }}>Cargando configuración...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      {puedeDesactivar && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 14 }}>Estado del asistente</h3>
            <span className="badge" style={{ background: config.estado === 'ACTIVA' ? '#166534' : config.estado === 'MANTENIMIENTO' ? '#451a03' : '#7f1d1d' }}>{config.estado}</span>
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
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
            <input className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Personaje</label>
            <input className="input-field" value={personaje} onChange={(e) => setPersonaje(e.target.value)} placeholder="ej. Mascota del Cuartel" />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descripción</label>
          <input className="input-field" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Personalidad</label>
          <textarea className="input-field" rows={3} value={personalidad} onChange={(e) => setPersonalidad(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Saludo</label>
          <input className="input-field" value={saludo} onChange={(e) => setSaludo(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Formalidad</label>
            <ComboBuscable opciones={FORMALIDADES} value={formalidad} onChange={setFormalidad} ningunaLabel="Media" />
          </div>
          <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, marginTop: 20 }}>
            <input type="checkbox" checked={permiteEmojis} onChange={(e) => setPermiteEmojis(e.target.checked)} />
            Permitir emojis
          </label>
        </div>
        <div>
          <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Instrucciones institucionales adicionales</label>
          <textarea className="input-field" rows={3} value={instrucciones} onChange={(e) => setInstrucciones(e.target.value)} placeholder="Reglas o contexto propio de esta institución para el asistente" />
        </div>
        <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={explicarInterpretacion} onChange={(e) => setExplicarInterpretacion(e.target.checked)} />
          Explicar interpretación (antepone a cada respuesta cómo se entendió la consulta — módulo, intención y filtros detectados)
        </label>

        <h3 style={{ fontSize: 14, marginTop: 6 }}>Límites de uso</h3>
        <p style={{ fontSize: 12, color: '#94a3b8' }}>
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
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Límite por minuto</label>
              <input className="input-field" type="number" min={1} value={limiteMinuto} onChange={(e) => setLimiteMinuto(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Límite por hora</label>
              <input className="input-field" type="number" min={1} value={limiteHora} onChange={(e) => setLimiteHora(e.target.value)} />
            </div>
          </div>
        )}

        <h3 style={{ fontSize: 14, marginTop: 6 }}>Módulos consultables</h3>
        <p style={{ fontSize: 12, color: '#94a3b8' }}>Restricción institucional adicional: aunque un usuario tenga permiso, el asistente solo usa herramientas de los módulos marcados aquí.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
          {MODULOS_DISPONIBLES.map((m) => (
            <label key={m.slug} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={modulosHabilitados.includes(m.slug)} onChange={() => alternarModulo(m.slug)} />
              {m.label}
            </label>
          ))}
        </div>

        <div>
          <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Motivo del cambio (queda en el historial)</label>
          <input className="input-field" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
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
            {historial.length === 0 && <p style={{ fontSize: 13, color: '#94a3b8' }}>Sin cambios registrados.</p>}
            {historial.map((h) => (
              <div key={h.id} style={{ fontSize: 12, padding: '8px 0', borderBottom: '1px solid #1f2937' }}>
                <div style={{ color: '#94a3b8' }}>{formatearFechaHora(h.creadoEn)} {h.ip ? `— ${h.ip}` : ''}</div>
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
