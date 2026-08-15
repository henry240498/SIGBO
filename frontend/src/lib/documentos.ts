import { apiFetch, API_ORIGIN, obtenerSesion } from './api';
import { cargarParametros } from './parametros';

/* ------------------------------------------------------------------ */
/* Catalogos parametrizables (Organizacion -> Parametros)               */
/* ------------------------------------------------------------------ */

export function cargarTiposDocumento() {
  return cargarParametros('TIPO_DOCUMENTO');
}
export function cargarCategoriasDocumento() {
  return cargarParametros('CATEGORIA_DOCUMENTO');
}
export function cargarEstadosDocumento() {
  return cargarParametros('ESTADO_DOCUMENTO');
}
export function cargarNivelesConfidencialidad() {
  return cargarParametros('NIVEL_CONFIDENCIALIDAD_DOCUMENTO');
}
export function cargarMotivosAnulacionDocumento() {
  return cargarParametros('MOTIVO_ANULACION_DOCUMENTO');
}

/* ------------------------------------------------------------------ */
/* Tipos                                                                */
/* ------------------------------------------------------------------ */

export type OrigenDocumento = 'INTERNO' | 'EXTERNO';
export type AlertaVigencia = 'VIGENTE' | 'PROXIMO_A_VENCER' | 'VENCIDO' | null;

export interface Documento {
  id: string;
  numeroDocumental: string | null;
  tipoDocumentoId: string;
  categoriaDocumentoId: string | null;
  titulo: string;
  descripcion: string | null;
  origen: OrigenDocumento;
  fechaEmision: string;
  fechaInicioVigencia: string | null;
  fechaVencimiento: string | null;
  estadoId: string;
  version: number;
  nivelConfidencialidadId: string | null;
  esFisico: boolean;
  archivoFisicoId: string | null;
  estante: string | null;
  caja: string | null;
  carpeta: string | null;
  archivoUrl: string | null;
  archivoNombreOriginal: string | null;
  archivoExtension: string | null;
  archivoTamanoBytes: number | null;
  expedienteId: string | null;
  ordenEnExpediente: number | null;
  plantillaId: string | null;
  generadoPorModulo: string | null;
  motivoAnulacionId: string | null;
  anuladoPor: string | null;
  fechaAnulacion: string | null;
  institucionId: string | null;
  disponibleParaIa: boolean;
  creadoEn: string;
  actualizadoEn: string;
  creadoPor: string | null;
  actualizadoPor: string | null;
  alertaVigencia?: AlertaVigencia;
}

export interface VersionArchivoDocumento {
  id: string;
  documentoId: string;
  numeroVersion: number;
  archivoUrl: string;
  archivoNombreOriginal: string | null;
  archivoExtension: string | null;
  archivoTamanoBytes: number | null;
  motivo: string | null;
  creadoEn: string;
  creadoPor: string | null;
}

export interface DocumentoRelacion {
  id: string;
  documentoId: string;
  modulo: string;
  entidad: string;
  registroId: string;
  etiqueta: string | null;
  creadoEn: string;
  creadoPor: string | null;
}

export interface Expediente {
  id: string;
  numero: string;
  titulo: string;
  descripcion: string | null;
  estado: 'ABIERTO' | 'CERRADO';
  institucionId: string | null;
  creadoEn: string;
  creadoPor: string | null;
}

export interface PlantillaDocumento {
  id: string;
  nombre: string;
  tipoDocumentoId: string | null;
  contenido: string;
  cargoFirmanteId: string | null;
  activa: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface FirmaDocumento {
  id: string;
  documentoId: string;
  orden: number;
  cargoFirmanteId: string | null;
  bomberoFirmanteId: string | null;
  etiquetaRol: string | null;
  firmado: boolean;
  firmaUrl: string | null;
  fechaFirma: string | null;
  firmadoPor: string | null;
  observacion: string | null;
  creadoEn: string;
}

export interface IndicadoresDocumentos {
  total: number;
  vigentes: number;
  proximosAVencer: number;
  vencidos: number;
  borradores: number;
  recientes: Documento[];
  proximosAVencerDetalle: Documento[];
  ultimosCargados: Documento[];
  ultimosModificados: Documento[];
}

export interface RegistroAuditoria {
  id: string;
  usuarioId: string | null;
  accion: string;
  recurso: string;
  recursoId: string | null;
  ip: string | null;
  datosAntes: string | null;
  datosDespues: string | null;
  metadata: string | null;
  fecha: string;
}

async function mensajeError(res: Response, porDefecto: string): Promise<string> {
  const body = await res.json().catch(() => ({}));
  return Array.isArray(body.message) ? body.message.join(', ') : body.message ?? porDefecto;
}

/* ------------------------------------------------------------------ */
/* Documentos                                                           */
/* ------------------------------------------------------------------ */

export interface FiltrosDocumentos {
  q?: string;
  tipoDocumentoId?: string;
  categoriaDocumentoId?: string;
  estadoId?: string;
  origen?: string;
  expedienteId?: string;
  desde?: string;
  hasta?: string;
  vencimiento?: 'PROXIMOS' | 'VENCIDOS';
}

export async function cargarDocumentos(filtros?: FiltrosDocumentos) {
  const params = new URLSearchParams();
  if (filtros?.q) params.set('q', filtros.q);
  if (filtros?.tipoDocumentoId) params.set('tipoDocumentoId', filtros.tipoDocumentoId);
  if (filtros?.categoriaDocumentoId) params.set('categoriaDocumentoId', filtros.categoriaDocumentoId);
  if (filtros?.estadoId) params.set('estadoId', filtros.estadoId);
  if (filtros?.origen) params.set('origen', filtros.origen);
  if (filtros?.expedienteId) params.set('expedienteId', filtros.expedienteId);
  if (filtros?.desde) params.set('desde', filtros.desde);
  if (filtros?.hasta) params.set('hasta', filtros.hasta);
  if (filtros?.vencimiento) params.set('vencimiento', filtros.vencimiento);
  const res = await apiFetch(`/documentos?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de documentos');
  return res.json() as Promise<Documento[]>;
}

export async function cargarDocumento(id: string) {
  const res = await apiFetch(`/documentos/${id}`);
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cargar el documento'));
  return res.json() as Promise<Documento>;
}

export async function cargarVersionesDocumento(id: string) {
  const res = await apiFetch(`/documentos/${id}/versiones`);
  if (!res.ok) throw new Error('No se pudo cargar las versiones del documento');
  return res.json() as Promise<VersionArchivoDocumento[]>;
}

export async function cargarRelacionesDocumento(id: string) {
  const res = await apiFetch(`/documentos/${id}/relaciones`);
  if (!res.ok) throw new Error('No se pudo cargar las relaciones del documento');
  return res.json() as Promise<DocumentoRelacion[]>;
}

export async function cargarAuditoriaDocumento(id: string) {
  const res = await apiFetch(`/documentos/${id}/auditoria`);
  if (!res.ok) throw new Error('No se pudo cargar la auditoria del documento');
  return res.json() as Promise<{ items: RegistroAuditoria[]; total: number }>;
}

export async function cargarAuditoriaGeneral(filtros?: { accion?: string; desde?: string; hasta?: string }) {
  const params = new URLSearchParams();
  if (filtros?.accion) params.set('accion', filtros.accion);
  if (filtros?.desde) params.set('desde', filtros.desde);
  if (filtros?.hasta) params.set('hasta', filtros.hasta);
  const res = await apiFetch(`/documentos/auditoria?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar la auditoria del modulo');
  return res.json() as Promise<{ items: RegistroAuditoria[]; total: number }>;
}

export async function cargarDocumentosDeEntidad(modulo: string, entidad: string, registroId: string) {
  const res = await apiFetch(`/documentos/relacionados/${modulo}/${entidad}/${registroId}`);
  if (!res.ok) throw new Error('No se pudo cargar los documentos relacionados');
  return res.json() as Promise<Documento[]>;
}

export interface CreateDocumentoInput {
  tipoDocumentoId: string;
  categoriaDocumentoId?: string;
  titulo: string;
  descripcion?: string;
  origen: OrigenDocumento;
  fechaEmision: string;
  fechaInicioVigencia?: string;
  fechaVencimiento?: string;
  nivelConfidencialidadId?: string;
  autoNumerar?: boolean;
  numeroDocumental?: string;
  esFisico?: boolean;
  archivoFisicoId?: string;
  estante?: string;
  caja?: string;
  carpeta?: string;
  expedienteId?: string;
  ordenEnExpediente?: number;
}

export async function crearDocumento(payload: CreateDocumentoInput) {
  const res = await apiFetch('/documentos', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear el documento'));
  return res.json() as Promise<Documento>;
}

export async function actualizarDocumento(id: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/documentos/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar el documento'));
  return res.json() as Promise<Documento>;
}

export async function subirArchivoDocumento(id: string, archivo: File, motivo?: string) {
  const formData = new FormData();
  formData.append('archivo', archivo);
  if (motivo) formData.append('motivo', motivo);
  const sesion = obtenerSesion();
  const headers: HeadersInit = {};
  if (sesion) headers['Authorization'] = `Bearer ${sesion.accessToken}`;
  const res = await fetch(`${API_ORIGIN}/api/v1/documentos/${id}/archivo`, { method: 'POST', headers, body: formData });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo subir el archivo'));
  return res.json() as Promise<Documento>;
}

export async function cambiarEstadoDocumento(id: string, estadoId: string, observacion?: string) {
  const res = await apiFetch(`/documentos/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estadoId, observacion }) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cambiar el estado del documento'));
  return res.json() as Promise<Documento>;
}

export async function aprobarDocumento(id: string) {
  const res = await apiFetch(`/documentos/${id}/aprobar`, { method: 'POST' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo aprobar el documento'));
  return res.json() as Promise<Documento>;
}

export async function publicarDocumento(id: string) {
  const res = await apiFetch(`/documentos/${id}/publicar`, { method: 'POST' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo publicar el documento'));
  return res.json() as Promise<Documento>;
}

export async function anularDocumento(id: string, motivoAnulacionId: string, detalle?: string) {
  const res = await apiFetch(`/documentos/${id}/anular`, { method: 'POST', body: JSON.stringify({ motivoAnulacionId, detalle }) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo anular el documento'));
  return res.json() as Promise<Documento>;
}

export async function archivarDocumento(id: string) {
  const res = await apiFetch(`/documentos/${id}/archivar`, { method: 'POST' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo archivar el documento'));
  return res.json() as Promise<Documento>;
}

export async function reabrirDocumento(id: string) {
  const res = await apiFetch(`/documentos/${id}/reabrir`, { method: 'POST' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo reabrir el documento'));
  return res.json() as Promise<Documento>;
}

export async function eliminarDocumento(id: string) {
  const res = await apiFetch(`/documentos/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo eliminar el documento'));
  return res.json();
}

export async function crearRelacionDocumento(id: string, payload: { modulo: string; entidad: string; registroId: string; etiqueta?: string }) {
  const res = await apiFetch(`/documentos/${id}/relaciones`, { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear la relacion'));
  return res.json() as Promise<DocumentoRelacion>;
}

export async function eliminarRelacionDocumento(relacionId: string) {
  const res = await apiFetch(`/documentos/relaciones/${relacionId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo eliminar la relacion'));
  return res.json();
}

/** Descarga el archivo digital vigente de un documento (requiere
 * documentos:descargar) -- usa apiFetch para llevar el Authorization
 * header, a diferencia de las imagenes publicas servidas por multer. */
export async function descargarArchivoDocumento(id: string, nombreArchivo: string): Promise<void> {
  const res = await apiFetch(`/documentos/${id}/archivo`);
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo descargar el archivo'));
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  a.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/* Dashboard / consultas                                                */
/* ------------------------------------------------------------------ */

export async function cargarIndicadoresDocumentos() {
  const res = await apiFetch('/documentos/dashboard');
  if (!res.ok) throw new Error('No se pudo cargar los indicadores de Documentos');
  return res.json() as Promise<IndicadoresDocumentos>;
}

export async function buscarDocumentos(q: string) {
  const res = await apiFetch(`/documentos/consultas/buscar?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error('No se pudo buscar documentos');
  return res.json() as Promise<Array<{ id: string; titulo: string; numeroDocumental: string | null; enlace: string }>>;
}

/* ------------------------------------------------------------------ */
/* Expedientes                                                          */
/* ------------------------------------------------------------------ */

export async function cargarExpedientes(estado?: string) {
  const params = new URLSearchParams();
  if (estado) params.set('estado', estado);
  const res = await apiFetch(`/documentos/expedientes?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de expedientes');
  return res.json() as Promise<Expediente[]>;
}

export async function cargarExpediente(id: string) {
  const res = await apiFetch(`/documentos/expedientes/${id}`);
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cargar el expediente'));
  return res.json() as Promise<Expediente>;
}

export async function cargarDocumentosDeExpediente(id: string) {
  const res = await apiFetch(`/documentos/expedientes/${id}/documentos`);
  if (!res.ok) throw new Error('No se pudo cargar los documentos del expediente');
  return res.json() as Promise<Documento[]>;
}

export async function crearExpediente(payload: { numero: string; titulo: string; descripcion?: string }) {
  const res = await apiFetch('/documentos/expedientes', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear el expediente'));
  return res.json() as Promise<Expediente>;
}

export async function actualizarExpediente(id: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/documentos/expedientes/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar el expediente'));
  return res.json() as Promise<Expediente>;
}

/* ------------------------------------------------------------------ */
/* Plantillas                                                           */
/* ------------------------------------------------------------------ */

export async function cargarPlantillas(activa?: string) {
  const params = new URLSearchParams();
  if (activa) params.set('activa', activa);
  const res = await apiFetch(`/documentos/plantillas?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de plantillas');
  return res.json() as Promise<PlantillaDocumento[]>;
}

export async function cargarPlantilla(id: string) {
  const res = await apiFetch(`/documentos/plantillas/${id}`);
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cargar la plantilla'));
  return res.json() as Promise<PlantillaDocumento>;
}

export async function crearPlantilla(payload: { nombre: string; tipoDocumentoId?: string; contenido: string; cargoFirmanteId?: string }) {
  const res = await apiFetch('/documentos/plantillas', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear la plantilla'));
  return res.json() as Promise<PlantillaDocumento>;
}

export async function actualizarPlantilla(id: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/documentos/plantillas/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar la plantilla'));
  return res.json() as Promise<PlantillaDocumento>;
}

export interface GenerarDesdePlantillaInput {
  titulo: string;
  fechaEmision: string;
  campos: Record<string, string>;
  categoriaDocumentoId?: string;
  cargoFirmanteId?: string;
  autoNumerar?: boolean;
  relaciones?: Array<{ modulo: string; entidad: string; registroId: string; etiqueta?: string }>;
}

export async function generarDesdePlantilla(plantillaId: string, payload: GenerarDesdePlantillaInput) {
  const res = await apiFetch(`/documentos/plantillas/${plantillaId}/generar`, { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo generar el documento desde la plantilla'));
  return res.json() as Promise<Documento>;
}

/* ------------------------------------------------------------------ */
/* Firmas                                                               */
/* ------------------------------------------------------------------ */

export async function cargarFirmasDocumento(documentoId: string) {
  const res = await apiFetch(`/documentos/${documentoId}/firmas`);
  if (!res.ok) throw new Error('No se pudo cargar las firmas del documento');
  return res.json() as Promise<FirmaDocumento[]>;
}

export async function definirFirmantes(documentoId: string, firmantes: Array<{ cargoFirmanteId?: string; bomberoFirmanteId?: string; etiquetaRol?: string; orden?: number }>) {
  const res = await apiFetch(`/documentos/${documentoId}/firmas`, { method: 'POST', body: JSON.stringify({ firmantes }) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo definir los firmantes'));
  return res.json() as Promise<FirmaDocumento[]>;
}

export async function firmarAutomatico(firmaId: string) {
  const res = await apiFetch(`/documentos/firmas/${firmaId}/firmar`, { method: 'POST' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo firmar automaticamente'));
  return res.json() as Promise<FirmaDocumento>;
}

export async function confirmarFirmaManual(firmaId: string, observacion?: string) {
  const res = await apiFetch(`/documentos/firmas/${firmaId}/confirmar-manual`, { method: 'POST', body: JSON.stringify({ observacion }) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo confirmar la firma manual'));
  return res.json() as Promise<FirmaDocumento>;
}
