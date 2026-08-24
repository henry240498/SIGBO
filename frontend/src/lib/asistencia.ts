import { API_ORIGIN, apiFetch } from './api';
import { cargarParametros } from './parametros';

/* ------------------------------------------------------------------ */
/* Tipos                                                                */
/* ------------------------------------------------------------------ */

export interface EventoAsistencia {
  id: string;
  nombre: string;
  descripcion: string | null;
  fechaInicio: string;
  fechaFin: string;
  ubicacion: string | null;
  responsableId: string | null;
  estado: string;
  tipoEventoId: string | null;
}

export interface ParticipanteEvento {
  id: string;
  eventoId: string;
  bomberoId: string | null;
  participanteExternoId: string | null;
  participanteId: string;
  horaRealInicio: string | null;
  horaRealFin: string | null;
  duracionMinutos: number | null;
  porcentajeParticipacion: number | null;
  estadoParticipacion: string;
  fuente: string;
  observacion: string | null;
  tipoParticipante: 'PERSONAL' | 'EXTERNO';
  nombreCompleto: string;
  codigoBombero: string | null;
}

export interface ParticipanteExternoInput {
  cedula?: string;
  nombre: string;
  apellido?: string;
  celular?: string;
  institucionProcedencia?: string;
  observacion?: string;
}

export interface ParticipanteExterno extends ParticipanteExternoInput {
  id: string;
  creadoEn: string;
}

export interface MarcacionAsistencia {
  id: string;
  eventoId: string | null;
  bomberoId: string;
  tipoMarcacion: 'ENTRADA' | 'SALIDA';
  metodo: string;
  timestampMarcacion: string;
  observaciones: string | null;
  fuente: string;
  motivo: string | null;
}

export interface Solapamiento {
  presenciaInicio: string | null;
  presenciaFin: string | null;
  participacionInicio: string | null;
  participacionFin: string | null;
  duracionParticipacionMinutos: number | null;
  porcentajeParticipacion: number | null;
  estadoSugerido: string;
}

export interface ToleranciaAsistencia {
  id: string;
  tipoEventoId: string | null;
  minutosToleranciaEntrada: number;
  minutosToleranciaSalida: number;
  estado: string;
}

export interface IndicadoresDashboard {
  enCuartel: number;
  eventosActivos: number;
  participantesActivosPorTipoEvento: Record<string, number>;
  ausentesDeActividadesFinalizadasHoy: number;
  fechaCalculo: string;
}

export type EstadoFilaImportacion = 'RECONOCIDO' | 'NO_IDENTIFICADO' | 'DUPLICADO' | 'YA_IMPORTADO' | 'INCONSISTENTE';
export type EstadoImportacion = 'ANALIZADO' | 'CONFIRMADO' | 'CANCELADO';

export interface ImportacionMarcador {
  id: string;
  archivoNombre: string;
  archivoHash: string;
  archivoUrl: string | null;
  usuarioId: string;
  fechaImportacion: string;
  hojasEncontradas: number;
  registrosEncontrados: number;
  registrosReconocidos: number;
  registrosNoIdentificados: number;
  registrosDuplicados: number;
  registrosConInconsistencias: number;
  registrosImportados: number | null;
  estado: EstadoImportacion;
}

export interface ImportacionMarcadorFila {
  id: string;
  importacionId: string;
  hojaExcel: string | null;
  filaExcel: number | null;
  datoOriginal: string;
  codigoDetectado: string | null;
  bomberoIdResuelto: string | null;
  tipoMarcacionDetectado: string | null;
  timestampDetectado: string | null;
  estadoFila: EstadoFilaImportacion;
  motivo: string | null;
  marcacionIdGenerada: string | null;
  nombreBombero: string | null;
  codigoBombero: string | null;
}

const ESTADOS_EVENTO = ['PROGRAMADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO'];
const ESTADOS_PARTICIPACION = ['COMPLETA', 'PARCIAL', 'NO_REGISTRADA', 'AUSENTE_CONFIRMADO'];
const ESTADOS_FILA_IMPORTACION: EstadoFilaImportacion[] = ['RECONOCIDO', 'NO_IDENTIFICADO', 'DUPLICADO', 'YA_IMPORTADO', 'INCONSISTENTE'];
const FUENTES_ASISTENCIA = ['MARCADOR_DIGITAL', 'MANUAL', 'IMPORTACION_EXCEL', 'EVENTO', 'GUARDIA', 'OTRO'];

export { ESTADOS_EVENTO, ESTADOS_PARTICIPACION, ESTADOS_FILA_IMPORTACION, FUENTES_ASISTENCIA };

/* ------------------------------------------------------------------ */
/* Tipos de evento (parametrizados)                                     */
/* ------------------------------------------------------------------ */

export function cargarTiposEvento() {
  return cargarParametros('TIPO_EVENTO_ASISTENCIA');
}

/* ------------------------------------------------------------------ */
/* Eventos                                                              */
/* ------------------------------------------------------------------ */

export async function cargarEventos(filtros?: { tipoEventoId?: string; estado?: string; desde?: string; hasta?: string }) {
  const params = new URLSearchParams();
  if (filtros?.tipoEventoId) params.set('tipoEventoId', filtros.tipoEventoId);
  if (filtros?.estado) params.set('estado', filtros.estado);
  if (filtros?.desde) params.set('desde', filtros.desde);
  if (filtros?.hasta) params.set('hasta', filtros.hasta);
  const res = await apiFetch(`/operaciones/eventos?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de eventos');
  return res.json() as Promise<EventoAsistencia[]>;
}

export async function cargarEvento(id: string) {
  const res = await apiFetch(`/operaciones/eventos/${id}`);
  if (!res.ok) throw new Error('No se pudo cargar el evento');
  return res.json() as Promise<EventoAsistencia>;
}

export async function crearEvento(payload: Record<string, unknown>) {
  const res = await apiFetch('/operaciones/eventos', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear el evento'));
  return res.json() as Promise<EventoAsistencia>;
}

export async function actualizarEvento(id: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/operaciones/eventos/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar el evento'));
  return res.json() as Promise<EventoAsistencia>;
}

export async function cargarParticipantes(eventoId: string) {
  const res = await apiFetch(`/operaciones/eventos/${eventoId}/participantes`);
  if (!res.ok) throw new Error('No se pudo cargar los participantes');
  return res.json() as Promise<ParticipanteEvento[]>;
}

export async function agregarParticipanteBombero(eventoId: string, bomberoId: string) {
  const res = await apiFetch(`/operaciones/eventos/${eventoId}/participantes`, {
    method: 'POST',
    body: JSON.stringify({ bomberoId }),
  });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo agregar el participante'));
  return res.json();
}

export async function agregarParticipanteExterno(eventoId: string, externo: ParticipanteExternoInput) {
  const res = await apiFetch(`/operaciones/eventos/${eventoId}/participantes`, {
    method: 'POST',
    body: JSON.stringify({ externo }),
  });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo agregar el participante externo'));
  return res.json();
}

export async function actualizarParticipacion(eventoId: string, participanteId: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/operaciones/eventos/${eventoId}/participantes/${participanteId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar la participacion'));
  return res.json();
}

export async function calcularDesdeMarcaciones(eventoId: string, participanteId: string) {
  const res = await apiFetch(`/operaciones/eventos/${eventoId}/participantes/${participanteId}/calcular-desde-marcaciones`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo calcular la participacion desde las marcaciones'));
  return res.json();
}

export async function quitarParticipante(eventoId: string, participanteId: string) {
  const res = await apiFetch(`/operaciones/eventos/${eventoId}/participantes/${participanteId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo quitar el participante'));
  return res.json();
}

/* ------------------------------------------------------------------ */
/* Marcaciones                                                          */
/* ------------------------------------------------------------------ */

export async function registrarMarcacion(payload: Record<string, unknown>) {
  const res = await apiFetch('/operaciones/marcaciones', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo registrar la marcacion'));
  return res.json() as Promise<MarcacionAsistencia>;
}

export async function listarMarcacionesPorBombero(bomberoId: string, desde?: string, hasta?: string) {
  const params = new URLSearchParams();
  if (desde) params.set('desde', desde);
  if (hasta) params.set('hasta', hasta);
  const res = await apiFetch(`/operaciones/marcaciones/bombero/${bomberoId}?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar las marcaciones');
  return res.json() as Promise<MarcacionAsistencia[]>;
}

export async function listarMarcacionesDelDia(fecha: string) {
  const res = await apiFetch(`/operaciones/marcaciones/dia/${fecha}`);
  if (!res.ok) throw new Error('No se pudo cargar las marcaciones del dia');
  return res.json() as Promise<MarcacionAsistencia[]>;
}

export interface FiltrosMarcaciones {
  bomberoId?: string;
  desde?: string;
  hasta?: string;
  fuente?: string;
  tipoMarcacion?: string;
  page?: number;
  pageSize?: number;
}

export interface ResultadoMarcaciones {
  items: MarcacionAsistencia[];
  total: number;
  page: number;
  pageSize: number;
}

/** Consulta general de marcaciones con filtros combinables, usada por el
 * Dashboard de consulta en Registro (no requiere un bombero puntual). */
export async function buscarMarcaciones(filtros: FiltrosMarcaciones) {
  const params = new URLSearchParams();
  if (filtros.bomberoId) params.set('bomberoId', filtros.bomberoId);
  if (filtros.desde) params.set('desde', filtros.desde);
  if (filtros.hasta) params.set('hasta', filtros.hasta);
  if (filtros.fuente) params.set('fuente', filtros.fuente);
  if (filtros.tipoMarcacion) params.set('tipoMarcacion', filtros.tipoMarcacion);
  if (filtros.page) params.set('page', String(filtros.page));
  if (filtros.pageSize) params.set('pageSize', String(filtros.pageSize));
  const res = await apiFetch(`/operaciones/marcaciones?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo consultar las marcaciones');
  return res.json() as Promise<ResultadoMarcaciones>;
}

export async function calcularSolapamiento(eventoId: string, bomberoId: string) {
  const res = await apiFetch(`/operaciones/marcaciones/solapamiento/${eventoId}/${bomberoId}`);
  if (!res.ok) throw new Error('No se pudo calcular el solapamiento');
  return res.json() as Promise<Solapamiento>;
}

/* ------------------------------------------------------------------ */
/* Participantes externos (CRUD propio, fuera de un evento)             */
/* ------------------------------------------------------------------ */

export async function cargarExternos(q?: string) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  const res = await apiFetch(`/operaciones/externos?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de personas externas');
  return res.json() as Promise<ParticipanteExterno[]>;
}

export async function crearExterno(dto: ParticipanteExternoInput) {
  const res = await apiFetch('/operaciones/externos', { method: 'POST', body: JSON.stringify(dto) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear la persona externa'));
  return res.json();
}

export async function actualizarExterno(id: string, dto: Partial<ParticipanteExternoInput>) {
  const res = await apiFetch(`/operaciones/externos/${id}`, { method: 'PATCH', body: JSON.stringify(dto) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar la persona externa'));
  return res.json();
}

/* ------------------------------------------------------------------ */
/* Tolerancias                                                          */
/* ------------------------------------------------------------------ */

export async function cargarTolerancias() {
  const res = await apiFetch('/operaciones/tolerancias');
  if (!res.ok) return [] as ToleranciaAsistencia[];
  return res.json() as Promise<ToleranciaAsistencia[]>;
}

export async function crearTolerancia(payload: Record<string, unknown>) {
  const res = await apiFetch('/operaciones/tolerancias', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear la tolerancia'));
  return res.json();
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                            */
/* ------------------------------------------------------------------ */

export async function cargarIndicadoresDashboard() {
  const res = await apiFetch('/operaciones/dashboard');
  if (!res.ok) throw new Error('No se pudo cargar el dashboard de asistencia');
  return res.json() as Promise<IndicadoresDashboard>;
}

/* ------------------------------------------------------------------ */
/* Importacion del marcador biometrico (Excel)                         */
/* ------------------------------------------------------------------ */

/** Sube el Excel exportado del reloj biometrico y devuelve el resumen del
 * analisis (sin confirmar todavia). Usa fetch crudo en vez de apiFetch
 * porque el body es FormData: apiFetch fuerza `Content-Type: application/json`,
 * lo que rompe el boundary multipart (mismo patron que la subida de foto de
 * perfil en mi-perfil/page.tsx). */
export async function analizarImportacionMarcador(archivo: File): Promise<ImportacionMarcador> {
  const formData = new FormData();
  formData.append('archivo', archivo);
  const res = await fetch(`${API_ORIGIN}/api/v1/operaciones/importaciones/analizar`, {
    method: 'POST',
    headers: { 'X-SIGBO-Request': '1' },
    body: formData,
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo analizar el archivo'));
  return res.json();
}

export async function listarHistorialImportaciones() {
  const res = await apiFetch('/operaciones/importaciones');
  if (!res.ok) throw new Error('No se pudo cargar el historial de importaciones');
  return res.json() as Promise<ImportacionMarcador[]>;
}

export async function obtenerImportacion(id: string) {
  const res = await apiFetch(`/operaciones/importaciones/${id}`);
  if (!res.ok) throw new Error('No se pudo cargar la importacion');
  return res.json() as Promise<ImportacionMarcador>;
}

export async function listarFilasImportacion(id: string, estadoFila?: EstadoFilaImportacion) {
  const params = new URLSearchParams();
  if (estadoFila) params.set('estadoFila', estadoFila);
  const res = await apiFetch(`/operaciones/importaciones/${id}/filas?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el detalle de la importacion');
  return res.json() as Promise<ImportacionMarcadorFila[]>;
}

export async function confirmarImportacion(id: string) {
  const res = await apiFetch(`/operaciones/importaciones/${id}/confirmar`, { method: 'POST' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo confirmar la importacion'));
  return res.json() as Promise<ImportacionMarcador>;
}

export async function cancelarImportacion(id: string) {
  const res = await apiFetch(`/operaciones/importaciones/${id}/cancelar`, { method: 'POST' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cancelar la importacion'));
  return res.json() as Promise<ImportacionMarcador>;
}

/* ------------------------------------------------------------------ */

async function mensajeError(res: Response, porDefecto: string): Promise<string> {
  const body = await res.json().catch(() => ({}));
  return Array.isArray(body.message) ? body.message.join(', ') : body.message ?? porDefecto;
}
