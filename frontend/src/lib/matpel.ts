import { apiFetch } from './api';

export interface EntradaMatpel { id: string; nombreOriginal: string; identificador: string | null; guiaId: string | null; referenciaId: string; resaltadoVerde: boolean | null; polimerizable: boolean | null }
export interface GuiaMatpel { id: string; numero: string; tituloOriginal: string | null; estadoContenido: string; referenciaId: string }
export interface BloqueMatpel { id: string; encabezadoOriginal: string | null; textoOriginal: string; referenciaId: string }
export interface CeldaMatpel { id: string; columnaCodigo: string; textoOriginal: string; unidadOriginal: string | null; referenciaId: string; modificador: string | null }
export interface ApartadoMatpel { estado: string; motivo: string; faltantes: string[]; celdas: CeldaMatpel[]; referenciaIds: string[]; finalidad?: string; fuenteResultado?: string; estadoImplementacion?: string }
export interface SolicitudMatpel { campo: string; etiqueta: string; motivo: string; referenciaIds: string[] }
export interface LecturaGuiaMatpel {
  numero: string; guiaId: string; advertencia: string;
  distancias: Array<{ textoOriginal: string; referenciaId: string }>;
  condiciones: Array<{ id: string; descripcion: string; condicionesActivacion: string[]; limites: string[];
    fuentes: Array<{ paginaPdf: number; paginaImpresa: string; extractoLiteral: string | null; referenciaIds: string[] }> }>;
}
export interface EvaluacionMatpel {
  versionGreId: string; versionMotor: string; documentoSha256: string; inputsHash: string;
  aislamiento: ApartadoMatpel; proteccion: ApartadoMatpel; tabla1: ApartadoMatpel; tabla2: ApartadoMatpel; tabla3: ApartadoMatpel;
  avisos: Array<{ codigo: string; motivo: string; referenciaIds: string[] }>;
  guias: GuiaMatpel[];
  geometria: GeometriaMatpel;
  solicitudes?: SolicitudMatpel[]; guiasLectura?: LecturaGuiaMatpel[];
  versionInterpretacion?: string; sha256Contenido?: string; sha256Interpretacion?: string;
  traza?: Array<{ paso: string; resultado: string; reglas: string[]; referenciaIds: string[] }>;
}
export interface GeometriaMatpel {
  versionGeometria: string; motivos: string[]; referenciaIds: string[]; calidadUbicacion: string; calidadViento: string; precisionM: number | null;
  aislamiento: { centro: [number, number]; radioM: number } | null;
  proteccion: { type: 'Polygon'; coordinates: [number, number][][]; distanciaM: number; anchoM: number; vientoDesdeGrados: number } | null;
}
export interface FichaMatpel { entrada: EntradaMatpel; guia?: GuiaMatpel; contenedoresTabla3: Array<{ id: string; nombre: string; referenciaId: string }>; solicitudes?: SolicitudMatpel[]; guiasLectura?: LecturaGuiaMatpel[] }
export type CertezaMatpel = 'NO_CONFIRMADO' | 'ESTIMADO' | 'CONFIRMADO';
export interface CampoMatpel { valor: string; certeza: CertezaMatpel }
export const campoVacio = (): CampoMatpel => ({ valor: '', certeza: 'NO_CONFIRMADO' });
export function datoMatpel(valor: unknown, certeza: CertezaMatpel) {
  return { valor, certeza: valor === null ? 'DESCONOCIDO' : certeza, origen: 'OPERADOR', observadoEn: null, evidenciaId: null, fuenteDatoId: null };
}
export async function consultaMatpel<T>(ruta: string, opciones?: RequestInit): Promise<T> {
  const res = await apiFetch(ruta, { ...opciones, signal: opciones?.signal ?? AbortSignal.timeout(30000) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(Array.isArray(body.message) ? body.message.join(' · ') : body.message ?? `No se pudo consultar MATPEL (${res.status}).`);
  }
  return res.json() as Promise<T>;
}

export async function descargarPaqueteMatpel(versionGreId: string, edicion: string) {
  const res = await apiFetch(`/matpel/versiones/${versionGreId}/paquete/archivo`, { signal: AbortSignal.timeout(120000) });
  if (!res.ok) { const error = await res.json().catch(() => ({})); throw new Error(error.message ?? 'No se pudo descargar la edición para consulta local.'); }
  const blob = await res.blob();
  const esperado = res.headers.get('X-Content-SHA256');
  if (!esperado) throw new Error('La descarga no entregó su huella de integridad.');
  const obtenido = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await blob.arrayBuffer()))).map(x => x.toString(16).padStart(2, '0')).join('');
  if (obtenido !== esperado) throw new Error('La descarga perdió integridad. Volver a descargar.');
  const url = URL.createObjectURL(blob);
  try {
    const enlace = document.createElement('a'); enlace.href = url; enlace.download = `GRE-${edicion.replace(/[^a-zA-Z0-9._-]/g, '_')}-consulta-local.html`;
    document.body.append(enlace); enlace.click(); enlace.remove();
  } finally { window.setTimeout(() => URL.revokeObjectURL(url), 1000); }
}
