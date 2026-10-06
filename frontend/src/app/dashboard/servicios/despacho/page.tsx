'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { obtenerSesion } from '@/lib/api';
import {
  ampliarSolicitudDespacho,
  cerrarSolicitudDespacho,
  crearSolicitudDespacho,
  detalleSolicitudDespacho,
  DestinatarioDespacho,
  EventoDespacho,
  listarSolicitudesDespacho,
  MovilDespacho,
  movilesDisponiblesDespacho,
  SolicitudDespacho,
  lineaSolicitudDespacho,
  mapaServicioOperativo,
  MapaServicioOperativo,
} from '@/lib/despacho';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';

const REFRESCO_MS = 8000;
const MapaServicio = dynamic(() => import('@/components/MapaServicioDespacho'), { ssr: false });
const etiquetaEvento = (tipo: string) => tipo === 'LIBERADO_POR_CANCELACION'
  ? 'Personal liberado al cancelar la solicitud'
  : tipo.replaceAll('_', ' ').toLowerCase();
const hora = (v: string | null) => v ? new Date(v).toLocaleString('es-PY') : '—';
const movilesHabilitadosEvento = (evento: EventoDespacho) => {
  const moviles = evento.detalle?.movilesHabilitados;
  return Array.isArray(moviles) && moviles.length ? ` · Autorizado: ${moviles.map(String).join(', ')}` : '';
};
const botonNeutro: React.CSSProperties = { background: 'var(--neutral-fill)', color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 8, padding: '8px 12px', fontSize: 13, cursor: 'pointer' };

export default function DespachoPage() {
  const [lista, setLista] = useState<SolicitudDespacho[] | null>(null);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<SolicitudDespacho | null>(null);
  const [eventos, setEventos] = useState<EventoDespacho[]>([]);
  const [mapa, setMapa] = useState<MapaServicioOperativo | null>(null);
  const [errorMapa, setErrorMapa] = useState('');
  const [moviles, setMoviles] = useState<MovilDespacho[]>([]);
  const [tipo, setTipo] = useState<'RAPIDA' | 'PERSONAL' | 'CHOFER'>('RAPIDA');
  const [movilesElegidos, setMovilesElegidos] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeSeguir = permisos.includes('despacho:seguimiento');
  const puedeSolicitar = permisos.includes('despacho:solicitar');

  const cargar = useCallback(async () => {
    if (!puedeSeguir) return;
    try {
      const filas = await listarSolicitudesDespacho();
      setLista(filas);
      if (seleccion) {
        const [d, l] = await Promise.all([detalleSolicitudDespacho(seleccion), lineaSolicitudDespacho(seleccion)]);
        setDetalle(d);
        setEventos(l);
        if (d.servicioId) {
          try {
            setMapa(await mapaServicioOperativo(d.servicioId));
            setErrorMapa('');
          } catch (e) {
            setMapa(null);
            setErrorMapa(e instanceof Error ? e.message : 'No se pudo consultar el mapa del servicio.');
          }
        } else {
          setMapa(null);
          setErrorMapa('Esta solicitud todavía no está vinculada a un servicio activo.');
        }
      }
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al consultar el despacho.');
    }
  }, [puedeSeguir, seleccion]);

  useEffect(() => {
    void cargar();
    const id = setInterval(() => void cargar(), REFRESCO_MS);
    return () => clearInterval(id);
  }, [cargar]);

  useEffect(() => {
    if (puedeSolicitar) void movilesDisponiblesDespacho().then(setMoviles).catch(() => setMoviles([]));
  }, [puedeSolicitar]);

  const visibles = useMemo(() => lista ?? [], [lista]);
  async function crear() {
    setError(''); setAviso(''); setOcupado(true);
    try {
      const creada = await crearSolicitudDespacho(tipo, tipo === 'CHOFER' ? movilesElegidos : []);
      setSeleccion(creada.id); setAviso('Solicitud enviada a las personas elegibles.'); setTipo('RAPIDA'); setMovilesElegidos([]);
      await cargar();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo crear la solicitud.'); }
    finally { setOcupado(false); }
  }
  async function ejecutar(accion: () => Promise<unknown>, mensaje: string) {
    setOcupado(true); setError(''); setAviso('');
    try { await accion(); setAviso(mensaje); await cargar(); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo completar la acción.'); }
    finally { setOcupado(false); }
  }

  if (!puedeSeguir) return <Aviso tipo="error" texto="Tu usuario no tiene permiso para ver el seguimiento de despacho." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 18, marginBottom: 4 }}>Despacho operativo</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>Solicitudes, disponibilidad y respuestas confirmadas. La lista se actualiza cada 8 segundos.</p>
      </div>
      {error && <Aviso tipo="error" texto={error} />}
      {aviso && <Aviso tipo="exito" texto={aviso} fontSize={13} />}

      {puedeSolicitar && (
        <section className="card" style={{ display: 'grid', gap: 12 }}>
          <strong>Crear solicitud</strong>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(['RAPIDA', 'PERSONAL', 'CHOFER'] as const).map((x) => (
              <button key={x} type="button" className={tipo === x ? 'btn-primary' : undefined} style={tipo === x ? undefined : botonNeutro} onClick={() => setTipo(x)}>
                {x === 'RAPIDA' ? 'Solicitud rápida' : x === 'PERSONAL' ? 'Solicitar personal' : 'Solicitar chofer'}
              </button>
            ))}
          </div>
          {tipo === 'CHOFER' && (
            <fieldset style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 12 }}>
              <legend>Móviles solicitados</legend>
              {moviles.length === 0 ? <p style={{ color: 'var(--muted)', fontSize: 12 }}>No hay móviles disponibles para elegir.</p> : moviles.map((m) => (
                <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
                  <input type="checkbox" checked={movilesElegidos.includes(m.id)} onChange={(e) => setMovilesElegidos(e.target.checked ? [...movilesElegidos, m.id] : movilesElegidos.filter((id) => id !== m.id))} />
                  Móvil {m.numeroInterno}{m.alias ? ` — ${m.alias}` : ''}
                </label>
              ))}
            </fieldset>
          )}
          <div><button className="btn-primary" type="button" disabled={ocupado || (tipo === 'CHOFER' && movilesElegidos.length === 0)} onClick={() => void crear()}>{ocupado ? 'Enviando…' : tipo === 'RAPIDA' ? 'Enviar llamado rápido' : 'Enviar solicitud'}</button></div>
        </section>
      )}

      {lista === null ? <Cargando texto="Cargando solicitudes…" /> : visibles.length === 0 ? (
        <section className="card" style={{ padding: 22, color: 'var(--muted)' }}>No hay solicitudes registradas.</section>
      ) : visibles.map((s) => (
        <section className="card" key={s.id} style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div><strong>{s.texto}</strong><div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 3 }}>{s.creadaPor} · {hora(s.creadoEn)}</div></div>
            <span className="badge" style={{ background: s.estado === 'ABIERTA' ? 'var(--ok-fill)' : 'var(--neutral-fill)' }}>{s.estado}</span>
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            <span className="badge">Respondieron: {s.totales.aceptaron ?? 0}</span>
            <span className="badge">{s.estado === 'CANCELADA' ? 'Iban en camino al cancelar' : 'En camino'}: {s.totales.enCamino ?? 0}</span>
            <span className="badge">Llegaron: {s.totales.llegaron ?? 0}</span>
            <span className="badge">Sin respuesta: {s.totales.sinResponder ?? 0}</span>
            <span className="badge">No recibieron: {s.totales.noRecibieron ?? 0}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" style={botonNeutro} onClick={() => { setDetalle(null); setSeleccion(seleccion === s.id ? null : s.id); }}> {seleccion === s.id ? 'Ocultar seguimiento' : 'Ver seguimiento'} </button>
            {puedeSolicitar && s.estado === 'ABIERTA' && <>
              <button type="button" style={botonNeutro} disabled={ocupado} onClick={() => void ejecutar(() => ampliarSolicitudDespacho(s.id), 'Se notificó a las personas en línea que pueden sumarse temporalmente.')}>Buscar personal adicional</button>
              <button type="button" style={botonNeutro} disabled={ocupado} onClick={() => void ejecutar(() => cerrarSolicitudDespacho(s.id, 'CERRADA'), 'Solicitud cerrada.')}>Cerrar</button>
              <button type="button" style={botonNeutro} disabled={ocupado} onClick={() => void ejecutar(() => cerrarSolicitudDespacho(s.id, 'CANCELADA'), 'Solicitud cancelada.')}>Cancelar</button>
            </>}
          </div>
          {seleccion === s.id && (detalle === null ? <Cargando texto="Actualizando seguimiento…" filas={2} /> : <Seguimiento solicitud={detalle} eventos={eventos} mapa={mapa} errorMapa={errorMapa} />)}
        </section>
      ))}
    </div>
  );
}

function Seguimiento({ solicitud, eventos, mapa, errorMapa }: {
  solicitud: SolicitudDespacho;
  eventos: EventoDespacho[];
  mapa: MapaServicioOperativo | null;
  errorMapa: string;
}) {
  const grupos: [string, DestinatarioDespacho[]][] = [
    [solicitud.estado === 'CANCELADA' ? 'Iban en camino al cancelar' : 'En camino', solicitud.grupos.enCamino], ['Llegaron', solicitud.grupos.llegaron],
    ['Aceptaron', solicitud.grupos.aceptaron], ['Aún no respondieron', [...solicitud.grupos.sinResponder, ...solicitud.grupos.enviadasSinConfirmar]],
    ['No pueden asistir', solicitud.grupos.noPueden], ['Cancelaron', solicitud.grupos.cancelaron],
    ['Sin conexión', solicitud.grupos.noRecibieron.sinConexion], ['No disponibles', solicitud.grupos.noRecibieron.noDisponible],
    ['Fuera de horario', solicitud.grupos.noRecibieron.fueraDeHorario], ['En otro servicio', solicitud.grupos.noRecibieron.enServicio],
    ['Sin autorización para los móviles pedidos', solicitud.grupos.noRecibieron.noHabilitadoChofer],
  ];
  return <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, display: 'grid', gap: 12 }}>
    <section style={{ background: 'var(--surface-2, #f5f7fa)', padding: 12, borderRadius: 9, display: 'grid', gap: 10 }}>
      <strong style={{ fontSize: 13 }}>Mapa y estado del servicio</strong>
      {errorMapa && <p style={{ color: 'var(--muted)', fontSize: 12, margin: 0 }}>{errorMapa}</p>}
      {mapa?.servicio.ubicacion && <p style={{ fontSize: 12, margin: 0 }}>{mapa.servicio.ubicacion.direccion ?? 'Ubicación autorizada'}</p>}
      {mapa && (mapa.servicio.ubicacion || mapa.moviles.some((m) => m.posicion))
        ? <MapaServicio datos={mapa} />
        : mapa?.servicio.ubicacionRestringida
          ? <p style={{ color: 'var(--muted)', fontSize: 12, margin: 0 }}>La ubicación exacta está reservada a perfiles autorizados.</p>
          : mapa ? <p style={{ color: 'var(--muted)', fontSize: 12, margin: 0 }}>Todavía no hay coordenadas del servicio o de sus móviles.</p> : null}
      {mapa && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 8 }}>
        <div><strong style={{ fontSize: 12 }}>Personal</strong>{mapa.personal.map((p, i) => <div key={`${p.nombre}-${i}`} style={{ fontSize: 12, paddingTop: 4 }}>{p.nombre} · {p.estado.replaceAll('_', ' ')}</div>)}</div>
        <div><strong style={{ fontSize: 12 }}>Móviles</strong>{mapa.moviles.map((m, i) => <div key={`${m.movil}-${i}`} style={{ fontSize: 12, paddingTop: 4 }}>{m.movil} · {m.estado.replaceAll('_', ' ')}{m.posicion ? ` · GPS ${hora(m.posicion.registradoEn)}` : ' · sin GPS reciente'}</div>)}</div>
      </div>}
    </section>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 8 }}>
      {grupos.filter(([, filas]) => filas.length).map(([titulo, filas]) => <div key={titulo} style={{ background: 'var(--surface-2, #f5f7fa)', padding: 10, borderRadius: 9 }}>
        <strong style={{ fontSize: 12 }}>{titulo} · {filas.length}</strong>
        <ul style={{ margin: '5px 0 0', paddingLeft: 18, fontSize: 12 }}>{filas.map((p) => <li key={`${titulo}-${p.usuarioId}`}>{p.usuarioNombre}{p.motivo ? ` — ${p.motivo}` : ''}{p.enCaminoEn ? ` · ${hora(p.enCaminoEn)}` : ''}</li>)}</ul>
      </div>)}
    </div>
    <div><strong style={{ fontSize: 13 }}>Línea de tiempo</strong>{eventos.length ? <ol style={{ margin: '6px 0 0', paddingLeft: 22, fontSize: 12 }}>{eventos.map((e) => <li key={e.id} style={{ padding: '2px 0' }}><time dateTime={e.ocurridoEn}>{hora(e.ocurridoEn)}</time> — {e.actor ?? 'Sistema'} · {etiquetaEvento(e.tipo)}{e.detalle?.afectado ? ` - ${String(e.detalle.afectado)}` : ''}{e.detalle?.motivo ? ` · ${String(e.detalle.motivo)}` : ''}{movilesHabilitadosEvento(e)}</li>)}</ol> : <p style={{ fontSize: 12, color: 'var(--muted)' }}>Sin eventos registrados.</p>}</div>
  </div>;
}
