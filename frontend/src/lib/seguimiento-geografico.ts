import { apiFetch } from './api';

export type TipoEventoGeografico =
  | 'SALIDA_CUARTEL' | 'LLEGADA_SERVICIO' | 'SALIDA_SERVICIO' | 'LLEGADA_CENTRO_SALUD'
  | 'SALIDA_CENTRO_SALUD' | 'REGRESO_CUARTEL' | 'FIN_SERVICIO' | 'PUNTO_CONTROL'
  | 'GPS' | 'INCIDENTE' | 'OBSERVACION' | 'OTRO';

export const ETIQUETA_EVENTO: Record<TipoEventoGeografico, string> = {
  SALIDA_CUARTEL: 'Salida del cuartel',
  LLEGADA_SERVICIO: 'Llegada al servicio',
  SALIDA_SERVICIO: 'Salida del servicio',
  LLEGADA_CENTRO_SALUD: 'Llegada a centro de salud',
  SALIDA_CENTRO_SALUD: 'Salida de centro de salud',
  REGRESO_CUARTEL: 'Regreso al cuartel',
  FIN_SERVICIO: 'Fin del servicio',
  PUNTO_CONTROL: 'Punto de control',
  GPS: 'Posición GPS',
  INCIDENTE: 'Incidente',
  OBSERVACION: 'Observación',
  OTRO: 'Otro destino',
};

export interface PuntoRuta {
  orden: number;
  lat: number;
  lon: number;
  etiqueta?: string;
}

export interface EventoGeografico {
  id: string;
  tipoEvento: TipoEventoGeografico;
  timestamp: string;
  lat: number | null;
  lon: number | null;
  movilId: string | null;
  movil: string | null;
  destino: string | null;
  observacion: string | null;
  creadoPor: string | null;
}

export interface PruebaComunicacion {
  id: string;
  lat: number;
  lon: number;
  distanciaMetros: number | null;
  nivel: number;
  movilId: string | null;
  movil: string | null;
  observacion: string | null;
  creadoEn: string;
  creadoPor: string | null;
}

export interface ResumenSeguimiento {
  servicio: { id: string; numeroServicio: string; direccion: string; estado: string };
  incidente: { lat: number; lon: number } | null;
  cuartel: { id: string; nombre: string; lat: number; lon: number } | null;
  rutaPlanificada: { id: string; puntos: PuntoRuta[]; actualizadoEn: string } | null;
  rutaRealizada: Array<{ lat: number; lon: number; timestamp: string }>;
  eventos: EventoGeografico[];
  pruebasComunicacion: PruebaComunicacion[];
}

async function mensajeError(res: Response, porDefecto: string): Promise<string> {
  const body = await res.json().catch(() => ({}));
  return Array.isArray(body.message) ? body.message.join(', ') : body.message ?? porDefecto;
}

const base = (servicioId: string) => `/servicios/${encodeURIComponent(servicioId)}/seguimiento`;

export async function cargarSeguimiento(servicioId: string): Promise<ResumenSeguimiento> {
  const res = await apiFetch(base(servicioId));
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cargar el seguimiento geográfico'));
  return res.json();
}

export async function guardarRutaPlanificada(servicioId: string, puntos: PuntoRuta[]) {
  const res = await apiFetch(`${base(servicioId)}/ruta-planificada`, { method: 'POST', body: JSON.stringify({ puntos }) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo guardar la ruta planificada'));
  return res.json();
}

export async function eliminarRutaPlanificada(servicioId: string) {
  const res = await apiFetch(`${base(servicioId)}/ruta-planificada`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo eliminar la ruta planificada'));
  return res.json();
}

export async function agregarEventoGeografico(servicioId: string, payload: { tipoEvento: TipoEventoGeografico; latitud: number; longitud: number; movilId?: string; destino?: string; observacion?: string }) {
  const res = await apiFetch(`${base(servicioId)}/eventos`, { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo registrar el evento'));
  return res.json() as Promise<EventoGeografico>;
}

export async function eliminarEventoGeografico(servicioId: string, eventoId: string) {
  const res = await apiFetch(`${base(servicioId)}/eventos/${encodeURIComponent(eventoId)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo eliminar el evento'));
  return res.json();
}

export async function agregarPruebaComunicacion(servicioId: string, payload: { latitud: number; longitud: number; nivel: number; movilId?: string; observacion?: string }) {
  const res = await apiFetch(`${base(servicioId)}/pruebas-comunicacion`, { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo registrar la prueba de comunicación'));
  return res.json() as Promise<PruebaComunicacion>;
}

export async function eliminarPruebaComunicacion(servicioId: string, pruebaId: string) {
  const res = await apiFetch(`${base(servicioId)}/pruebas-comunicacion/${encodeURIComponent(pruebaId)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo eliminar la prueba de comunicación'));
  return res.json();
}
