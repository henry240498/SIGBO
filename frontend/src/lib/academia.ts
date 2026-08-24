import { apiFetch } from './api';
import { cargarParametros } from './parametros';
import { EventoAsistencia } from './asistencia';

/* ------------------------------------------------------------------ */
/* Tipos                                                                */
/* ------------------------------------------------------------------ */

export type EstadoActividadAcademica = 'PLANIFICADA' | 'ABIERTA' | 'EN_CURSO' | 'FINALIZADA' | 'CANCELADA';

export interface ActividadAcademica {
  id: string;
  codigo: string | null;
  nombre: string;
  tipoActividadId: string;
  descripcion: string | null;
  objetivo: string | null;
  institucionOrganizadora: string | null;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string | null;
  horaFin: string | null;
  duracionHoras: number | null;
  modalidadId: string | null;
  lugar: string | null;
  responsableBomberoId: string | null;
  cupo: number | null;
  requisitos: string | null;
  estado: EstadoActividadAcademica;
  observaciones: string | null;
  esExterna: boolean;
  costo: number | null;
}

export interface InstructorExternoInput {
  nombre: string;
  apellido?: string;
  documento?: string;
  institucion?: string;
  especialidad?: string;
  telefono?: string;
  email?: string;
  observaciones?: string;
  activo?: boolean;
}

export interface InstructorExterno extends InstructorExternoInput {
  id: string;
  creadoEn: string;
}

export interface InstructorDeActividad {
  id: string;
  rolInstructor: 'PRINCIPAL' | 'AYUDANTE';
  tipo: 'PERSONAL' | 'EXTERNO';
  bomberoId?: string;
  numeroBombero?: string | null;
  instructorExternoId?: string;
  nombreCompleto: string;
  rango?: string | null;
  institucion?: string | null;
  especialidad?: string | null;
}

export type EstadoInscripcionActividad = 'INSCRITO' | 'ACTIVO' | 'RETIRADO' | 'FINALIZADO';

export interface ParticipanteExternoAcademiaInput {
  cedula?: string;
  nombre: string;
  apellido?: string;
  celular?: string;
  institucionProcedencia?: string;
  observacion?: string;
}

export interface EvaluacionAcademica {
  id: string;
  actividadId: string;
  tipoEvaluacionId: string;
  titulo: string | null;
  fecha: string | null;
  evaluadorBomberoId: string | null;
  evaluadorExternoId: string | null;
  escala: string | null;
  observaciones: string | null;
}

export interface NotaParticipante {
  inscripcionId: string;
  notaId: string | null;
  nombreCompleto: string;
  numeroBombero: string | null;
  calificacion: number | null;
  resultadoId: string | null;
  resultado: string | null;
  observaciones: string | null;
}

export interface ParticipanteDeActividad {
  id: string;
  tipo: 'PERSONAL' | 'EXTERNO';
  bomberoId?: string;
  numeroBombero?: string | null;
  participanteExternoId?: string;
  nombreCompleto: string;
  rango?: string | null;
  institucionProcedencia?: string | null;
  fechaInscripcion: string;
  estado: EstadoInscripcionActividad;
  resultadoFinalId: string | null;
  resultadoFinal: string | null;
  observaciones: string | null;
  costoBase?: number | null;
  beneficioAplicadoId?: string | null;
  descuentoImporte?: number | null;
  costoFinal?: number | null;
}

/* ------------------------------------------------------------------ */
/* Catalogos parametrizables (Organizacion -> Parametros)               */
/* ------------------------------------------------------------------ */

export function cargarTiposActividadAcademica() {
  return cargarParametros('TIPO_ACTIVIDAD_ACADEMICA');
}

export function cargarModalidadesAcademicas() {
  return cargarParametros('MODALIDAD_ACADEMICA');
}

export function cargarTiposEvaluacionAcademica() {
  return cargarParametros('TIPO_EVALUACION_ACADEMICA');
}

export function cargarResultadosAcademicos() {
  return cargarParametros('RESULTADO_ACADEMICO');
}

/* ------------------------------------------------------------------ */
/* Actividades                                                          */
/* ------------------------------------------------------------------ */

export async function cargarActividades(filtros?: {
  tipoActividadId?: string;
  estado?: string;
  esExterna?: boolean;
  desde?: string;
  hasta?: string;
}) {
  const params = new URLSearchParams();
  if (filtros?.tipoActividadId) params.set('tipoActividadId', filtros.tipoActividadId);
  if (filtros?.estado) params.set('estado', filtros.estado);
  if (filtros?.esExterna !== undefined) params.set('esExterna', String(filtros.esExterna));
  if (filtros?.desde) params.set('desde', filtros.desde);
  if (filtros?.hasta) params.set('hasta', filtros.hasta);
  const res = await apiFetch(`/academia/actividades?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de actividades');
  return res.json() as Promise<ActividadAcademica[]>;
}

export async function cargarActividad(id: string) {
  const res = await apiFetch(`/academia/actividades/${id}`);
  if (!res.ok) throw new Error('No se pudo cargar la actividad');
  return res.json() as Promise<ActividadAcademica>;
}

export async function crearActividad(payload: Record<string, unknown>) {
  const res = await apiFetch('/academia/actividades', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear la actividad'));
  return res.json() as Promise<ActividadAcademica>;
}

export async function actualizarActividad(id: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/academia/actividades/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar la actividad'));
  return res.json() as Promise<ActividadAcademica>;
}

/* ------------------------------------------------------------------ */
/* Instructores de una actividad                                        */
/* ------------------------------------------------------------------ */

export async function cargarInstructoresDeActividad(actividadId: string) {
  const res = await apiFetch(`/academia/actividades/${actividadId}/instructores`);
  if (!res.ok) throw new Error('No se pudo cargar los instructores');
  return res.json() as Promise<InstructorDeActividad[]>;
}

export async function asignarInstructorBombero(actividadId: string, bomberoId: string, rolInstructor?: string) {
  const res = await apiFetch(`/academia/actividades/${actividadId}/instructores`, {
    method: 'POST',
    body: JSON.stringify({ bomberoId, rolInstructor }),
  });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo asignar el instructor'));
  return res.json();
}

export async function asignarInstructorExterno(actividadId: string, externo: InstructorExternoInput, rolInstructor?: string) {
  const res = await apiFetch(`/academia/actividades/${actividadId}/instructores`, {
    method: 'POST',
    body: JSON.stringify({ externo, rolInstructor }),
  });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo asignar el instructor'));
  return res.json();
}

export async function quitarInstructor(actividadId: string, instructorId: string) {
  const res = await apiFetch(`/academia/actividades/${actividadId}/instructores/${instructorId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo quitar el instructor'));
  return res.json();
}

/* ------------------------------------------------------------------ */
/* Participantes (inscripciones) de una actividad                       */
/* ------------------------------------------------------------------ */

export async function cargarParticipantesDeActividad(actividadId: string) {
  const res = await apiFetch(`/academia/actividades/${actividadId}/participantes`);
  if (!res.ok) throw new Error('No se pudo cargar los participantes');
  return res.json() as Promise<ParticipanteDeActividad[]>;
}

export async function inscribirBombero(actividadId: string, bomberoId: string) {
  const res = await apiFetch(`/academia/actividades/${actividadId}/participantes`, {
    method: 'POST',
    body: JSON.stringify({ bomberoId }),
  });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo inscribir al participante'));
  return res.json();
}

export async function inscribirExterno(actividadId: string, externo: ParticipanteExternoAcademiaInput) {
  const res = await apiFetch(`/academia/actividades/${actividadId}/participantes`, {
    method: 'POST',
    body: JSON.stringify({ externo }),
  });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo inscribir al participante'));
  return res.json();
}

export async function actualizarInscripcion(
  actividadId: string,
  inscripcionId: string,
  dto: { estado?: string; resultadoFinalId?: string; observaciones?: string },
) {
  const res = await apiFetch(`/academia/actividades/${actividadId}/participantes/${inscripcionId}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar la inscripcion'));
  return res.json();
}

export async function quitarParticipante(actividadId: string, inscripcionId: string) {
  const res = await apiFetch(`/academia/actividades/${actividadId}/participantes/${inscripcionId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo quitar al participante'));
  return res.json();
}

/* ------------------------------------------------------------------ */
/* Sesiones (jornadas) de una actividad -- cada una es un evento de     */
/* Asistencia enlazado. La asistencia por sesion se gestiona con las    */
/* pantallas ya existentes de Asistencia, no se duplican aqui.          */
/* ------------------------------------------------------------------ */

export async function cargarSesionesDeActividad(actividadId: string) {
  const res = await apiFetch(`/academia/actividades/${actividadId}/sesiones`);
  if (!res.ok) throw new Error('No se pudo cargar las sesiones');
  return res.json() as Promise<EventoAsistencia[]>;
}

export async function crearSesion(
  actividadId: string,
  payload: { nombre?: string; fechaInicio: string; fechaFin: string; ubicacion?: string; tipoEventoId?: string; inscribirParticipantesActuales?: boolean },
) {
  const res = await apiFetch(`/academia/actividades/${actividadId}/sesiones`, { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear la sesion'));
  return res.json() as Promise<EventoAsistencia>;
}

/* ------------------------------------------------------------------ */
/* Evaluaciones y notas                                                 */
/* ------------------------------------------------------------------ */

export async function cargarEvaluaciones(actividadId: string) {
  const res = await apiFetch(`/academia/actividades/${actividadId}/evaluaciones`);
  if (!res.ok) throw new Error('No se pudo cargar las evaluaciones');
  return res.json() as Promise<EvaluacionAcademica[]>;
}

export async function crearEvaluacion(
  actividadId: string,
  payload: { tipoEvaluacionId: string; titulo?: string; fecha?: string; escala?: string; observaciones?: string },
) {
  const res = await apiFetch(`/academia/actividades/${actividadId}/evaluaciones`, { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear la evaluacion'));
  return res.json() as Promise<EvaluacionAcademica>;
}

export async function cargarNotas(evaluacionId: string) {
  const res = await apiFetch(`/academia/evaluaciones/${evaluacionId}/notas`);
  if (!res.ok) throw new Error('No se pudo cargar las notas');
  return res.json() as Promise<NotaParticipante[]>;
}

export async function registrarNota(
  evaluacionId: string,
  inscripcionId: string,
  dto: { calificacion?: number; resultadoId?: string; observaciones?: string },
) {
  const res = await apiFetch(`/academia/evaluaciones/${evaluacionId}/notas/${inscripcionId}`, { method: 'PUT', body: JSON.stringify(dto) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo registrar la nota'));
  return res.json();
}

/* ------------------------------------------------------------------ */
/* Certificaciones (personal.certificaciones) -- autoservicio o          */
/* academia:certificar, ver certificaciones-academia.service.ts         */
/* ------------------------------------------------------------------ */

export type TipoCertificacion = 'BASICO' | 'INTERMEDIO' | 'AVANZADO' | 'ESPECIALIDAD' | 'CURSO' | 'SEMINARIO' | 'TALLER' | 'ENTRENAMIENTO';
export type EstadoCertificacion = 'VIGENTE' | 'VENCIDO' | 'EN_PROCESO';

export interface Certificacion {
  id: string;
  bomberoId: string;
  tipo: TipoCertificacion;
  nombre: string;
  institucion: string | null;
  fechaObtencion: string;
  fechaVencimiento: string | null;
  numeroCertificado: string | null;
  archivoUrl: string | null;
  estado: EstadoCertificacion;
  duracionHoras: number | null;
  instructor: string | null;
  actividadAcademicaId: string | null;
}

export interface CertificacionInput {
  bomberoId: string;
  tipo: TipoCertificacion;
  nombre: string;
  institucion?: string;
  fechaObtencion: string;
  fechaVencimiento?: string;
  numeroCertificado?: string;
  estado?: EstadoCertificacion;
  duracionHoras?: number;
  instructor?: string;
  actividadAcademicaId?: string;
}

export async function cargarCertificacionesDeBombero(bomberoId: string) {
  const res = await apiFetch(`/personal/bomberos/${bomberoId}/certificaciones`);
  if (!res.ok) throw new Error('No se pudo cargar las certificaciones');
  return res.json() as Promise<Certificacion[]>;
}

function construirFormDataCertificacion(datos: CertificacionInput, archivo?: File) {
  const formData = new FormData();
  Object.entries(datos).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') formData.append(clave, String(valor));
  });
  if (archivo) formData.append('archivo', archivo);
  return formData;
}

async function fetchConArchivo(path: string, method: 'POST' | 'PATCH', formData: FormData) {
  const res = await apiFetch(path, { method, body: formData });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo guardar la certificacion'));
  return res.json();
}

export async function crearCertificacion(datos: CertificacionInput, archivo?: File) {
  return fetchConArchivo('/academia/certificaciones', 'POST', construirFormDataCertificacion(datos, archivo)) as Promise<Certificacion>;
}

export async function actualizarCertificacion(id: string, datos: Partial<Omit<CertificacionInput, 'bomberoId'>>, archivo?: File) {
  return fetchConArchivo(`/academia/certificaciones/${id}`, 'PATCH', construirFormDataCertificacion(datos as CertificacionInput, archivo)) as Promise<Certificacion>;
}

export async function eliminarCertificacion(id: string) {
  const res = await apiFetch(`/academia/certificaciones/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo eliminar la certificacion'));
  return res.json();
}

/* ------------------------------------------------------------------ */
/* Catalogo de instructores externos                                    */
/* ------------------------------------------------------------------ */

export async function cargarInstructoresExternos(q?: string) {
  const params = q ? `?q=${encodeURIComponent(q)}` : '';
  const res = await apiFetch(`/academia/instructores-externos${params}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de instructores externos');
  return res.json() as Promise<InstructorExterno[]>;
}

export async function actualizarInstructorExterno(id: string, dto: Partial<InstructorExternoInput>) {
  const res = await apiFetch(`/academia/instructores-externos/${id}`, { method: 'PATCH', body: JSON.stringify(dto) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar el instructor externo'));
  return res.json() as Promise<InstructorExterno>;
}

/* ------------------------------------------------------------------ */
/* Reportes (motor documental institucional -- IdentidadInstitucional)  */
/* ------------------------------------------------------------------ */

export async function generarReporteActividadPdf(actividadId: string, cargoFirmanteId?: string) {
  const params = cargoFirmanteId ? `?cargoFirmanteId=${cargoFirmanteId}` : '';
  const res = await apiFetch(`/academia/actividades/${actividadId}/reporte.pdf${params}`);
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo generar el reporte PDF'));
  return (await res.json()) as { url: string };
}

export async function generarReporteActividadDocx(actividadId: string, cargoFirmanteId?: string) {
  const params = cargoFirmanteId ? `?cargoFirmanteId=${cargoFirmanteId}` : '';
  const res = await apiFetch(`/academia/actividades/${actividadId}/reporte.docx${params}`);
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo generar el reporte DOCX'));
  return (await res.json()) as { url: string };
}

/* ------------------------------------------------------------------ */
/* Cursos externos recomendados (OBA/Thinkific) -- solo lectura,        */
/* informacion publica, nunca simula el login del sitio externo.        */
/* ------------------------------------------------------------------ */

export interface CursoExterno {
  id: string;
  titulo: string;
  url: string;
  imagenUrl: string | null;
  categoria: string | null;
  duracionTexto: string | null;
  fuente: string;
  actualizadoEn: string;
}

export async function cargarCursosExternos() {
  const res = await apiFetch('/academia/cursos-externos');
  if (!res.ok) throw new Error('No se pudo cargar los cursos externos');
  return res.json() as Promise<{ urlLogin: string; cursos: CursoExterno[] }>;
}

export async function refrescarCursosExternos() {
  const res = await apiFetch('/academia/cursos-externos/refrescar', { method: 'POST' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar el catalogo de cursos externos'));
  return res.json() as Promise<{ actualizados: number }>;
}

/* ------------------------------------------------------------------ */

async function mensajeError(res: Response, porDefecto: string): Promise<string> {
  const body = await res.json().catch(() => ({}));
  return Array.isArray(body.message) ? body.message.join(', ') : body.message ?? porDefecto;
}
