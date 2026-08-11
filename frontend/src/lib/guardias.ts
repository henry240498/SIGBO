import { apiFetch } from './api';

/* ------------------------------------------------------------------ */
/* Tipos                                                                */
/* ------------------------------------------------------------------ */

export interface Guardia {
  id: string;
  fecha: string;
  turno: string;
  horaInicio: string;
  horaFin: string;
  tipo: string;
  estado: string;
  jefeGuardiaId: string | null;
  grupoGuardiaId: string | null;
  observaciones: string | null;
  cierreResponsableId: string | null;
  cierreObservacion: string | null;
  cierreResumen: string | null;
  cerradaEn: string | null;
}

export type TipoParticipacionGuardia = 'TITULAR' | 'REFUERZO' | 'REEMPLAZO';

export interface AsignacionGuardia {
  id: string;
  guardiaId: string;
  bomberoId: string;
  rol: string | null;
  estado: string;
  tipoParticipacion: TipoParticipacionGuardia;
  reemplazaAsignacionId: string | null;
  horaEntrada: string | null;
  horaSalida: string | null;
  estadoPresencia: string | null;
  motivo: string | null;
  observaciones: string | null;
  nombreCompleto: string;
  codigoBombero: string | null;
}

export interface Cumplimiento {
  presenciaInicio: string | null;
  presenciaFin: string | null;
  participacionInicio: string | null;
  participacionFin: string | null;
  duracionParticipacionMinutos: number | null;
  porcentajeParticipacion: number | null;
  estadoSugerido: string;
}

export interface GrupoGuardia {
  id: string;
  nombre: string;
  oficialACargoId: string | null;
  estado: 'ACTIVO' | 'INACTIVO';
  observaciones: string | null;
  creadoEn: string;
}

export type RolGrupoGuardia = 'TITULAR' | 'CHOFER';

export interface GrupoGuardiaMiembro {
  id: string;
  grupoId: string;
  bomberoId: string;
  rol: RolGrupoGuardia;
  orden: number;
  nombreCompleto: string;
  codigoBombero: string | null;
}

export interface Pernocte {
  id: string;
  guardiaId: string | null;
  fecha: string;
  bomberoId: string;
  horaEntrada: string | null;
  horaSalida: string | null;
  motivo: string | null;
  observacion: string | null;
  nombreCompleto: string;
  codigoBombero: string | null;
}

export interface InspeccionEstacion {
  id: string;
  guardiaId: string;
  sector: string;
  sectorNombre: string | null;
  estado: 'OK' | 'NO_OK';
  observacion: string | null;
  responsableId: string | null;
  creadoEn: string;
}

export interface NovedadGuardia {
  id: string;
  guardiaId: string;
  fechaHora: string;
  bomberoId: string | null;
  texto: string;
  autorNombre: string | null;
}

export interface RequisitoRolGuardia {
  id: string;
  rol: string;
  cargoIdRequerido: string | null;
  rangoIdRequerido: string | null;
  tipoBomberoIdRequerido: string | null;
  activo: boolean;
}

const TURNOS_GUARDIA = ['DIURNO', 'NOCTURNO', 'COMPLETO'];
const TIPOS_GUARDIA_REGISTRO = ['ORDINARIA', 'ESPECIAL', 'EXTRAORDINARIA'];
const ROLES_GUARDIA_BASE = ['OFICIAL_A_CARGO', 'CHOFER'];
export { TURNOS_GUARDIA, TIPOS_GUARDIA_REGISTRO, ROLES_GUARDIA_BASE };

async function mensajeError(res: Response, porDefecto: string): Promise<string> {
  const body = await res.json().catch(() => ({}));
  return Array.isArray(body.message) ? body.message.join(', ') : body.message ?? porDefecto;
}

/* ------------------------------------------------------------------ */
/* Guardias                                                             */
/* ------------------------------------------------------------------ */

export async function cargarGuardias(desde?: string, hasta?: string) {
  const params = new URLSearchParams();
  if (desde) params.set('desde', desde);
  if (hasta) params.set('hasta', hasta);
  const res = await apiFetch(`/guardias?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de guardias');
  return res.json() as Promise<Guardia[]>;
}

export async function cargarGuardia(id: string) {
  const res = await apiFetch(`/guardias/${id}`);
  if (!res.ok) throw new Error('No se pudo cargar la guardia');
  return res.json() as Promise<Guardia>;
}

export async function crearGuardia(payload: Record<string, unknown>) {
  const res = await apiFetch('/guardias', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear la guardia'));
  return res.json() as Promise<Guardia>;
}

export async function listarAsignacionesGuardia(guardiaId: string) {
  const res = await apiFetch(`/guardias/${guardiaId}/asignaciones`);
  if (!res.ok) throw new Error('No se pudo cargar el personal asignado');
  return res.json() as Promise<AsignacionGuardia[]>;
}

export async function asignarPersonalGuardia(guardiaId: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/guardias/${guardiaId}/asignaciones`, { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo asignar el personal'));
  return res.json() as Promise<AsignacionGuardia>;
}

export async function quitarAsignacionGuardia(guardiaId: string, asignacionId: string) {
  const res = await apiFetch(`/guardias/${guardiaId}/asignaciones/${asignacionId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo quitar la asignacion'));
  return res.json();
}

export async function registrarHorarioAsignacion(guardiaId: string, asignacionId: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/guardias/${guardiaId}/asignaciones/${asignacionId}/horario`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo registrar el horario'));
  return res.json() as Promise<AsignacionGuardia>;
}

export async function actualizarPresenciaAsignacion(guardiaId: string, asignacionId: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/guardias/${guardiaId}/asignaciones/${asignacionId}/presencia`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar la presencia'));
  return res.json() as Promise<AsignacionGuardia>;
}

export async function calcularCumplimiento(guardiaId: string, bomberoId: string) {
  const res = await apiFetch(`/guardias/${guardiaId}/cumplimiento/${bomberoId}`);
  if (!res.ok) throw new Error('No se pudo calcular el cumplimiento');
  return res.json() as Promise<Cumplimiento>;
}

/* ------------------------------------------------------------------ */
/* Grupos de guardia                                                    */
/* ------------------------------------------------------------------ */

export async function cargarGruposGuardia(estado?: string) {
  const params = new URLSearchParams();
  if (estado) params.set('estado', estado);
  const res = await apiFetch(`/guardias/grupos?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de grupos');
  return res.json() as Promise<GrupoGuardia[]>;
}

export async function cargarGrupoGuardia(id: string) {
  const res = await apiFetch(`/guardias/grupos/${id}`);
  if (!res.ok) throw new Error('No se pudo cargar el grupo');
  return res.json() as Promise<GrupoGuardia>;
}

export async function crearGrupoGuardia(payload: Record<string, unknown>) {
  const res = await apiFetch('/guardias/grupos', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear el grupo'));
  return res.json() as Promise<GrupoGuardia>;
}

export async function actualizarGrupoGuardia(id: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/guardias/grupos/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar el grupo'));
  return res.json() as Promise<GrupoGuardia>;
}

export async function listarMiembrosGrupo(grupoId: string) {
  const res = await apiFetch(`/guardias/grupos/${grupoId}/miembros`);
  if (!res.ok) throw new Error('No se pudo cargar los miembros del grupo');
  return res.json() as Promise<GrupoGuardiaMiembro[]>;
}

export async function agregarMiembroGrupo(grupoId: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/guardias/grupos/${grupoId}/miembros`, { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo agregar el miembro'));
  return res.json() as Promise<GrupoGuardiaMiembro>;
}

export async function quitarMiembroGrupo(grupoId: string, miembroId: string) {
  const res = await apiFetch(`/guardias/grupos/${grupoId}/miembros/${miembroId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo quitar el miembro'));
  return res.json();
}

/* ------------------------------------------------------------------ */
/* Pernoctantes                                                         */
/* ------------------------------------------------------------------ */

export async function listarPernoctes(fecha?: string, guardiaId?: string) {
  const params = new URLSearchParams();
  if (fecha) params.set('fecha', fecha);
  if (guardiaId) params.set('guardiaId', guardiaId);
  const res = await apiFetch(`/guardias/pernoctes?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar los pernoctes');
  return res.json() as Promise<Pernocte[]>;
}

export async function crearPernocte(payload: Record<string, unknown>) {
  const res = await apiFetch('/guardias/pernoctes', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo registrar el pernocte'));
  return res.json() as Promise<Pernocte>;
}

export async function registrarSalidaPernocte(id: string, horaSalida: string) {
  const res = await apiFetch(`/guardias/pernoctes/${id}/salida`, { method: 'PATCH', body: JSON.stringify({ horaSalida }) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo registrar la salida'));
  return res.json() as Promise<Pernocte>;
}

/* ------------------------------------------------------------------ */
/* Condicion de estacion                                                */
/* ------------------------------------------------------------------ */

export async function listarInspeccionesEstacion(guardiaId: string) {
  const res = await apiFetch(`/guardias/${guardiaId}/inspecciones-estacion`);
  if (!res.ok) throw new Error('No se pudo cargar las inspecciones');
  return res.json() as Promise<InspeccionEstacion[]>;
}

export async function crearInspeccionEstacion(guardiaId: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/guardias/${guardiaId}/inspecciones-estacion`, { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo registrar la inspeccion'));
  return res.json() as Promise<InspeccionEstacion>;
}

/* ------------------------------------------------------------------ */
/* Novedades / bitacora manual                                          */
/* ------------------------------------------------------------------ */

export async function listarNovedades(guardiaId: string) {
  const res = await apiFetch(`/guardias/${guardiaId}/novedades`);
  if (!res.ok) throw new Error('No se pudo cargar las novedades');
  return res.json() as Promise<NovedadGuardia[]>;
}

export async function crearNovedad(guardiaId: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/guardias/${guardiaId}/novedades`, { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo registrar la novedad'));
  return res.json() as Promise<NovedadGuardia>;
}

/* ------------------------------------------------------------------ */
/* Requisitos de rol (elegibilidad configurable)                        */
/* ------------------------------------------------------------------ */

export async function cargarRequisitosRol(rol?: string) {
  const params = new URLSearchParams();
  if (rol) params.set('rol', rol);
  const res = await apiFetch(`/guardias/requisitos-rol?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar los requisitos de rol');
  return res.json() as Promise<RequisitoRolGuardia[]>;
}

export async function crearRequisitoRol(payload: Record<string, unknown>) {
  const res = await apiFetch('/guardias/requisitos-rol', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear el requisito'));
  return res.json() as Promise<RequisitoRolGuardia>;
}

export async function toggleActivoRequisito(id: string, activo: boolean) {
  const res = await apiFetch(`/guardias/requisitos-rol/${id}/activo`, { method: 'PATCH', body: JSON.stringify({ activo }) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar el requisito'));
  return res.json() as Promise<RequisitoRolGuardia>;
}

export async function eliminarRequisitoRol(id: string) {
  const res = await apiFetch(`/guardias/requisitos-rol/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo eliminar el requisito'));
  return res.json();
}
