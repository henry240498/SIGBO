'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { obtenerSesion } from '@/lib/api';
import { cargarVehiculos, type Vehiculo } from '@/lib/vehiculos';
import {
  ETIQUETA_EVENTO,
  ResumenSeguimiento,
  TipoEventoGeografico,
  agregarEventoGeografico,
  agregarPruebaComunicacion,
  cargarSeguimiento,
  eliminarEventoGeografico,
  eliminarPruebaComunicacion,
  eliminarRutaPlanificada,
  guardarRutaPlanificada,
} from '@/lib/seguimiento-geografico';
import type { ModoClicMapa } from './MapaSeguimiento';

const MapaSeguimiento = dynamic(() => import('./MapaSeguimiento'), { ssr: false, loading: () => <p style={{ color: 'var(--muted)', fontSize: 13 }}>Cargando mapa…</p> });

const TIPOS_EVENTO: TipoEventoGeografico[] = [
  'SALIDA_CUARTEL', 'LLEGADA_SERVICIO', 'SALIDA_SERVICIO', 'LLEGADA_CENTRO_SALUD',
  'SALIDA_CENTRO_SALUD', 'REGRESO_CUARTEL', 'FIN_SERVICIO', 'PUNTO_CONTROL', 'INCIDENTE', 'OBSERVACION', 'OTRO',
];

const NIVELES = [
  { valor: 5, etiqueta: 'Muy bueno', color: '#16a34a' },
  { valor: 4, etiqueta: 'Bueno', color: '#16a34a' },
  { valor: 3, etiqueta: 'Regular', color: '#eab308' },
  { valor: 2, etiqueta: 'Malo', color: '#f97316' },
  { valor: 1, etiqueta: 'Muy malo', color: '#dc2626' },
];

/** "🗺️ Seguimiento Geográfico y Operativo" -- seccion nueva dentro de
 * la ficha del servicio (no dentro del formulario de la Comunicacion:
 * usa su propio modulo backend, servicios:ver_gps/despachar). Solo se
 * muestra cuando ya existe un servicioId (primer guardado hecho). */
export function SeguimientoGeografico({ servicioId }: { servicioId: string }) {
  const confirmar = useConfirmacion();
  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeVer = permisos.includes('servicios:ver_gps');
  const puedeGestionar = permisos.includes('servicios:despachar');

  const [resumen, setResumen] = useState<ResumenSeguimiento | null>(null);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [modo, setModo] = useState<ModoClicMapa>('ninguno');
  const [rutaEnEdicion, setRutaEnEdicion] = useState<Array<{ orden: number; lat: number; lon: number }>>([]);
  const [tipoEventoElegido, setTipoEventoElegido] = useState<TipoEventoGeografico>('PUNTO_CONTROL');
  const [pendiente, setPendiente] = useState<{ lat: number; lon: number } | null>(null);
  const [destino, setDestino] = useState('');
  const [observacion, setObservacion] = useState('');
  const [movilId, setMovilId] = useState('');
  const [nivel, setNivel] = useState(3);

  async function cargar() {
    try {
      setResumen(await cargarSeguimiento(servicioId));
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (!puedeVer) { setCargando(false); return; }
    void cargar();
    cargarVehiculos().then(setVehiculos).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servicioId, puedeVer]);

  function cancelarModo() {
    setModo('ninguno');
    setRutaEnEdicion([]);
    setPendiente(null);
    setDestino('');
    setObservacion('');
    setMovilId('');
    setNivel(3);
  }

  function onMapClick(lat: number, lon: number) {
    if (modo === 'ruta') {
      setRutaEnEdicion((anterior) => [...anterior, { orden: anterior.length, lat, lon }]);
    } else if (modo === 'evento' || modo === 'prueba') {
      setPendiente({ lat, lon });
    }
  }

  async function guardarRuta() {
    if (rutaEnEdicion.length < 2) { setError('La ruta planificada necesita al menos 2 puntos.'); return; }
    setGuardando(true);
    setError(null);
    try {
      await guardarRutaPlanificada(servicioId, rutaEnEdicion);
      setMensaje('Ruta planificada guardada.');
      cancelarModo();
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function quitarRuta() {
    if (!await confirmar({ titulo: 'Confirmar acción', mensaje: '¿Eliminar la ruta planificada de este servicio?', confirmar: 'Eliminar', peligro: true })) return;
    setGuardando(true);
    try {
      await eliminarRutaPlanificada(servicioId);
      setMensaje('Ruta planificada eliminada.');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarEvento() {
    if (!pendiente) return;
    setGuardando(true);
    setError(null);
    try {
      await agregarEventoGeografico(servicioId, {
        tipoEvento: tipoEventoElegido,
        latitud: pendiente.lat,
        longitud: pendiente.lon,
        movilId: movilId || undefined,
        destino: destino || undefined,
        observacion: observacion || undefined,
      });
      setMensaje('Evento registrado.');
      cancelarModo();
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarPrueba() {
    if (!pendiente) return;
    setGuardando(true);
    setError(null);
    try {
      await agregarPruebaComunicacion(servicioId, {
        latitud: pendiente.lat,
        longitud: pendiente.lon,
        nivel,
        movilId: movilId || undefined,
        observacion: observacion || undefined,
      });
      setMensaje('Prueba de comunicación registrada.');
      cancelarModo();
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function quitarEvento(id: string) {
    if (!await confirmar({ titulo: 'Confirmar acción', mensaje: '¿Eliminar este evento?', confirmar: 'Eliminar', peligro: true })) return;
    try {
      await eliminarEventoGeografico(servicioId, id);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function quitarPrueba(id: string) {
    if (!await confirmar({ titulo: 'Confirmar acción', mensaje: '¿Eliminar esta prueba de comunicación?', confirmar: 'Eliminar', peligro: true })) return;
    try {
      await eliminarPruebaComunicacion(servicioId, id);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (!puedeVer) return null;

  return (
    <section className="card service-section" style={{ marginTop: 16 }}>
      <div className="service-section-title"><span>🗺️</span><div><h3>Seguimiento Geográfico y Operativo</h3><p>Ubicación del cuartel e incidente, ruta planificada, eventos del recorrido y pruebas de comunicación.</p></div></div>

      {error && <p className="form-error" role="alert">{error}</p>}
      {mensaje && <p style={{ color: 'var(--success)', fontSize: 13 }}>{mensaje}</p>}
      {cargando && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Cargando seguimiento…</p>}

      {resumen && (
        <>
          <div style={{ height: 420, marginBottom: 12 }}>
            <MapaSeguimiento
              cuartel={resumen.cuartel}
              incidente={resumen.incidente}
              rutaPlanificada={resumen.rutaPlanificada?.puntos ?? null}
              rutaEnEdicion={rutaEnEdicion}
              rutaRealizada={resumen.rutaRealizada}
              eventos={resumen.eventos}
              pruebas={resumen.pruebasComunicacion}
              modoClic={modo}
              onMapClick={onMapClick}
            />
          </div>

          <div className="geo-legend" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
            <span>🟢 Cuartel</span>
            <span>🔴 Incidente</span>
            <span style={{ color: 'var(--signal)' }}>— Ruta planificada</span>
            <span style={{ color: '#0891b2' }}>— Ruta realizada</span>
            <span>📍 Evento</span>
            <span>🟢🟡🟠🔴 Prueba de comunicación (nivel 5→1)</span>
          </div>

          {!resumen.cuartel && <p style={{ fontSize: 12, color: 'var(--muted)' }}>No hay un cuartel de referencia con coordenadas cargadas (o hay más de uno activo) — la distancia de las pruebas de comunicación no se calculará hasta configurarlo en Organización Institucional.</p>}

          {puedeGestionar && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {modo === 'ninguno' && <>
                  <button type="button" className="btn-primary" onClick={() => setModo('ruta')}>Definir ruta</button>
                  <select className="input-field" style={{ width: 'auto' }} value={tipoEventoElegido} onChange={(e) => setTipoEventoElegido(e.target.value as TipoEventoGeografico)}>
                    {TIPOS_EVENTO.map((t) => <option key={t} value={t}>{ETIQUETA_EVENTO[t]}</option>)}
                  </select>
                  <button type="button" className="service-secondary" onClick={() => setModo('evento')}>Agregar evento</button>
                  <button type="button" className="service-secondary" onClick={() => setModo('prueba')}>Prueba de comunicación</button>
                  {resumen.rutaPlanificada && <button type="button" className="service-secondary" onClick={() => void quitarRuta()} disabled={guardando}>Eliminar ruta planificada</button>}
                </>}
                {modo === 'ruta' && <>
                  <span style={{ fontSize: 13, color: 'var(--muted)', alignSelf: 'center' }}>Haga clic en el mapa para agregar puntos ({rutaEnEdicion.length} agregado{rutaEnEdicion.length === 1 ? '' : 's'}).</span>
                  <button type="button" className="btn-primary" disabled={guardando} onClick={() => void guardarRuta()}>Guardar ruta</button>
                  <button type="button" className="service-secondary" onClick={cancelarModo}>Cancelar</button>
                </>}
                {(modo === 'evento' || modo === 'prueba') && !pendiente && (
                  <>
                    <span style={{ fontSize: 13, color: 'var(--muted)', alignSelf: 'center' }}>Haga clic en el mapa para marcar {modo === 'evento' ? 'el evento' : 'la prueba'}.</span>
                    <button type="button" className="service-secondary" onClick={cancelarModo}>Cancelar</button>
                  </>
                )}
              </div>

              {pendiente && modo === 'evento' && (
                <div className="card" style={{ background: 'var(--surface-soft)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <strong style={{ fontSize: 13 }}>Nuevo evento: {ETIQUETA_EVENTO[tipoEventoElegido]}</strong>
                  <input className="input-field" placeholder="Destino / etiqueta (ej. nombre del centro de salud)" value={destino} onChange={(e) => setDestino(e.target.value)} />
                  <select className="input-field" value={movilId} onChange={(e) => setMovilId(e.target.value)}>
                    <option value="">Sin móvil asociado</option>
                    {vehiculos.map((v) => <option key={v.id} value={v.id}>{v.numeroInterno}</option>)}
                  </select>
                  <textarea className="input-field" rows={2} placeholder="Observación (opcional)" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="btn-primary" disabled={guardando} onClick={() => void confirmarEvento()}>Guardar evento</button>
                    <button type="button" className="service-secondary" onClick={cancelarModo}>Cancelar</button>
                  </div>
                </div>
              )}

              {pendiente && modo === 'prueba' && (
                <div className="card" style={{ background: 'var(--surface-soft)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <strong style={{ fontSize: 13 }}>Nueva prueba de comunicación</strong>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {NIVELES.map((n) => (
                      <button key={n.valor} type="button" onClick={() => setNivel(n.valor)} style={{ padding: '6px 12px', borderRadius: 8, border: nivel === n.valor ? `2px solid ${n.color}` : '1px solid var(--line)', background: nivel === n.valor ? n.color : 'transparent', color: nivel === n.valor ? '#fff' : 'var(--ink)', cursor: 'pointer', fontSize: 12 }}>
                        {n.valor}/5 — {n.etiqueta}
                      </button>
                    ))}
                  </div>
                  <select className="input-field" value={movilId} onChange={(e) => setMovilId(e.target.value)}>
                    <option value="">Sin móvil asociado</option>
                    {vehiculos.map((v) => <option key={v.id} value={v.id}>{v.numeroInterno}</option>)}
                  </select>
                  <textarea className="input-field" rows={2} placeholder="Observación (opcional)" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="btn-primary" disabled={guardando} onClick={() => void confirmarPrueba()}>Guardar prueba</button>
                    <button type="button" className="service-secondary" onClick={cancelarModo}>Cancelar</button>
                  </div>
                </div>
              )}
            </div>
          )}

          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12 }}>
            Ruta planificada: {resumen.rutaPlanificada ? 'Sí' : 'No'} · Ruta realizada: {resumen.rutaRealizada.length > 0 ? `Disponible (${resumen.rutaRealizada.length} puntos)` : 'No disponible'}
          </p>

          {resumen.eventos.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Eventos del recorrido</p>
              {resumen.eventos.map((e) => (
                <div key={e.id} style={{ fontSize: 12, padding: '5px 0', borderBottom: '1px solid var(--line-soft)', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span><span className="badge" style={{ background: 'var(--neutral-fill)', marginRight: 6 }}>{ETIQUETA_EVENTO[e.tipoEvento]}</span>{e.destino ? `${e.destino} · ` : ''}{e.movil ? `${e.movil} · ` : ''}{new Date(e.timestamp).toLocaleString('es-PY')}</span>
                  {puedeGestionar && <button type="button" className="service-secondary" style={{ padding: '2px 8px', fontSize: 11 }} onClick={() => void quitarEvento(e.id)}>Eliminar</button>}
                </div>
              ))}
            </div>
          )}

          {resumen.pruebasComunicacion.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Pruebas de comunicación</p>
              {resumen.pruebasComunicacion.map((prueba) => (
                <div key={prueba.id} style={{ fontSize: 12, padding: '5px 0', borderBottom: '1px solid var(--line-soft)', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span>
                    <span className="badge" style={{ background: COLOR(prueba.nivel), marginRight: 6 }}>{prueba.nivel}/5</span>
                    {prueba.distanciaMetros != null ? `${(prueba.distanciaMetros / 1000).toFixed(2)} km del cuartel · ` : ''}
                    {prueba.movil ? `${prueba.movil} · ` : ''}
                    {new Date(prueba.creadoEn).toLocaleString('es-PY')}
                  </span>
                  {puedeGestionar && <button type="button" className="service-secondary" style={{ padding: '2px 8px', fontSize: 11 }} onClick={() => void quitarPrueba(prueba.id)}>Eliminar</button>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function COLOR(nivel: number) {
  return NIVELES.find((n) => n.valor === nivel)?.color ?? '#334155';
}
