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
  esquemaHorarioId: string | null;
  feriadoId: string | null;
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
  cicloRotacionDias: number | null;
  diasSemanaCsv: string | null;
  cantidadMinima: number | null;
  cantidadMaxima: number | null;
  cantidadOficiales: number | null;
  cantidadChoferes: number | null;
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
const ESTADOS_GUARDIA = ['PLANIFICADA', 'CONFIRMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA', 'ANULADA'];
const DIAS_SEMANA_CSV = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
const TIPOS_FERIADO = ['FIJO', 'MOVIL', 'TRASLADADO'];
export { TURNOS_GUARDIA, TIPOS_GUARDIA_REGISTRO, ROLES_GUARDIA_BASE, ESTADOS_GUARDIA, DIAS_SEMANA_CSV, TIPOS_FERIADO };

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

export interface ItemPlanificacionGuardia {
  guardiaId?: string;
  fecha: string;
  turno: string;
  horaInicio: string;
  horaFin: string;
  grupoGuardiaId: string;
  observaciones?: string;
}

/** Guarda una distribución de la grilla. La API sólo permite reemplazar
 * guardias aún planificadas y registra cada modificación en auditoría. */
export async function planificarGuardias(items: ItemPlanificacionGuardia[]) {
  const res = await apiFetch('/guardias/planificacion/manual', {
    method: 'POST',
    body: JSON.stringify({ items, reemplazarPlanificadas: true }),
  });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo guardar la planificación'));
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

export async function actualizarGuardia(id: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/guardias/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar la guardia'));
  return res.json() as Promise<Guardia>;
}

export async function anularGuardia(id: string, motivo: string) {
  const res = await apiFetch(`/guardias/${id}/anular`, { method: 'POST', body: JSON.stringify({ motivo }) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo anular la guardia'));
  return res.json() as Promise<Guardia>;
}

export interface ResultadoGeneracion {
  guardiasCreadas: number;
  guardiaIds: string[];
  personasAsignadas: number;
  advertencias: string[];
}

/** Motor de planificacion automatica (Fase B): es un asistente heuristico,
 * no un optimizador exacto -- cada guardia generada queda inmediatamente
 * editable/anulable con las herramientas manuales normales. */
export async function generarPlanificacion(payload: {
  desde: string;
  hasta: string;
  permitirRepetirIntegrantes?: boolean;
  regenerarExistentes?: boolean;
}) {
  const res = await apiFetch('/guardias/generar', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo generar la planificacion'));
  return res.json() as Promise<ResultadoGeneracion>;
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

/* ------------------------------------------------------------------ */
/* Esquemas de horario de guardia (plantillas parametrizables)          */
/* ------------------------------------------------------------------ */

export interface EsquemaHorarioGuardia {
  id: string;
  nombre: string;
  diasSemanaCsv: string | null;
  horaInicio: string;
  horaFin: string;
  cruzaMedianoche: boolean;
  diasDuracion: number;
  esEspecial: boolean;
  usaRotacionGrupo: boolean;
  requiereOficial: boolean;
  requiereChofer: boolean;
  cantidadMinima: number | null;
  cantidadMaxima: number | null;
  cantidadOficiales: number;
  cantidadChoferes: number;
  orden: number;
  activo: boolean;
}

export async function cargarEsquemasHorario(soloActivos?: boolean) {
  const params = new URLSearchParams();
  if (soloActivos) params.set('soloActivos', 'true');
  const res = await apiFetch(`/guardias/esquemas-horario?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar los esquemas de horario');
  return res.json() as Promise<EsquemaHorarioGuardia[]>;
}

export async function crearEsquemaHorario(payload: Record<string, unknown>) {
  const res = await apiFetch('/guardias/esquemas-horario', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear el esquema de horario'));
  return res.json() as Promise<EsquemaHorarioGuardia>;
}

export async function actualizarEsquemaHorario(id: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/guardias/esquemas-horario/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar el esquema de horario'));
  return res.json() as Promise<EsquemaHorarioGuardia>;
}

export async function eliminarEsquemaHorario(id: string) {
  const res = await apiFetch(`/guardias/esquemas-horario/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo eliminar el esquema de horario'));
  return res.json();
}

/* ------------------------------------------------------------------ */
/* Feriados (calendario institucional, incluye feriados moviles)        */
/* ------------------------------------------------------------------ */

export interface Feriado {
  id: string;
  fecha: string;
  nombre: string;
  tipo: 'FIJO' | 'MOVIL' | 'TRASLADADO';
  fechaOriginal: string | null;
  esEspecial: boolean;
  activo: boolean;
  observacion: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export async function cargarFeriados(desde?: string, hasta?: string, soloActivos?: boolean) {
  const params = new URLSearchParams();
  if (desde) params.set('desde', desde);
  if (hasta) params.set('hasta', hasta);
  if (soloActivos) params.set('soloActivos', 'true');
  const res = await apiFetch(`/organizacion/feriados?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de feriados');
  return res.json() as Promise<Feriado[]>;
}

export async function crearFeriado(payload: Record<string, unknown>) {
  const res = await apiFetch('/organizacion/feriados', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear el feriado'));
  return res.json() as Promise<Feriado>;
}

export async function actualizarFeriado(id: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/organizacion/feriados/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar el feriado'));
  return res.json() as Promise<Feriado>;
}

/** Traslada un feriado movil a una nueva fecha. Nunca reclasifica guardias
 * en silencio: devuelve las guardias que caian en la fecha original y en la
 * fecha nueva para que el responsable las revise manualmente. */
export async function moverFeriado(id: string, nuevaFecha: string, motivo: string) {
  const res = await apiFetch(`/organizacion/feriados/${id}/mover`, {
    method: 'POST',
    body: JSON.stringify({ nuevaFecha, motivo }),
  });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo trasladar el feriado'));
  return res.json() as Promise<{
    feriado: Feriado;
    guardiasAfectadasFechaOriginal: Guardia[];
    guardiasAfectadasFechaNueva: Guardia[];
  }>;
}

export async function eliminarFeriado(id: string) {
  const res = await apiFetch(`/organizacion/feriados/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo desactivar el feriado'));
  return res.json() as Promise<Feriado>;
}

/* ------------------------------------------------------------------ */
/* Sorteos (fechas especiales)                                          */
/* ------------------------------------------------------------------ */

export interface SorteoGuardia {
  id: string;
  fecha: string;
  motivo: string;
  cantidadASeleccionar: number;
  esquemaHorarioId: string | null;
  guardiaId: string | null;
  ejecutadoPor: string | null;
  ejecutadoEn: string;
  observacion: string | null;
}

export interface SorteoParticipante {
  id: string;
  sorteoId: string;
  bomberoId: string;
  seleccionado: boolean;
  orden: number;
  nombreCompleto: string;
  codigoBombero: string | null;
}

export interface DetalleSorteo {
  sorteo: SorteoGuardia;
  participantes: SorteoParticipante[];
}

export async function cargarSorteos(desde?: string, hasta?: string) {
  const params = new URLSearchParams();
  if (desde) params.set('desde', desde);
  if (hasta) params.set('hasta', hasta);
  const res = await apiFetch(`/guardias/sorteos?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de sorteos');
  return res.json() as Promise<SorteoGuardia[]>;
}

export async function cargarDetalleSorteo(id: string) {
  const res = await apiFetch(`/guardias/sorteos/${id}`);
  if (!res.ok) throw new Error('No se pudo cargar el sorteo');
  return res.json() as Promise<DetalleSorteo>;
}

export async function generarSorteo(payload: {
  fecha: string;
  motivo: string;
  cantidadASeleccionar: number;
  esquemaHorarioId?: string;
}) {
  const res = await apiFetch('/guardias/sorteos', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo generar el sorteo'));
  return res.json() as Promise<DetalleSorteo>;
}

export async function crearGuardiaDesdeSorteo(id: string, esquemaHorarioId?: string) {
  const res = await apiFetch(`/guardias/sorteos/${id}/crear-guardia`, {
    method: 'POST',
    body: JSON.stringify({ esquemaHorarioId }),
  });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear la guardia desde el sorteo'));
  return res.json() as Promise<{ sorteo: SorteoGuardia; guardia: Guardia }>;
}

/* ------------------------------------------------------------------ */
/* Consultas ampliadas (historial personal / grupo)                     */
/* ------------------------------------------------------------------ */

export interface HistorialAsignacion extends AsignacionGuardia {
  guardia: Guardia;
}

/** Siempre por el id interno del bombero (GUID), nunca por el codigo
 * bomberil. */
export async function cargarHistorialGuardiasPersonal(bomberoId: string) {
  const res = await apiFetch(`/guardias/personal/${bomberoId}`);
  if (!res.ok) throw new Error('No se pudo cargar el historial de guardias');
  return res.json() as Promise<HistorialAsignacion[]>;
}

export async function cargarHistorialGrupo(grupoId: string) {
  const res = await apiFetch(`/guardias/grupos/${grupoId}/historial`);
  if (!res.ok) throw new Error('No se pudo cargar el historial del grupo');
  return res.json() as Promise<Guardia[]>;
}

/* ------------------------------------------------------------------ */
/* Condicion de moviles                                                 */
/* ------------------------------------------------------------------ */

export interface VehiculoResumen {
  id: string;
  numeroInterno: string;
  tipo: string;
  marca: string | null;
  modelo: string | null;
  patente: string | null;
  estado: string;
}

export interface EquipoResumen {
  id: string;
  nombre: string;
  codigoInterno: string;
  estado: string;
}

export interface ChecklistItemVehiculo {
  id: string;
  tipoVehiculo: string | null;
  nombre: string;
  categoria: 'MECANICA' | 'EQUIPAMIENTO' | 'OTRO';
  orden: number;
  activo: boolean;
}

export interface MovilARevisar {
  vehiculo: VehiculoResumen;
  checklistItems: ChecklistItemVehiculo[];
  equipos: EquipoResumen[];
}

export interface InspeccionMovil {
  id: string;
  guardiaId: string;
  vehiculoId: string;
  checklistItemId: string;
  estado: 'OK' | 'NO_OK';
  observacion: string | null;
  responsableId: string | null;
  creadoEn: string;
  vehiculoNombre: string;
  checklistItemNombre: string;
}

export async function cargarMovilesARevisar(guardiaId: string) {
  const res = await apiFetch(`/guardias/${guardiaId}/inspecciones-movil/a-revisar`);
  if (!res.ok) throw new Error('No se pudo cargar los moviles a revisar');
  return res.json() as Promise<MovilARevisar[]>;
}

export async function listarInspeccionesMovil(guardiaId: string) {
  const res = await apiFetch(`/guardias/${guardiaId}/inspecciones-movil`);
  if (!res.ok) throw new Error('No se pudo cargar las inspecciones de movil');
  return res.json() as Promise<InspeccionMovil[]>;
}

export async function crearInspeccionMovil(guardiaId: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/guardias/${guardiaId}/inspecciones-movil`, { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo registrar la inspeccion'));
  return res.json() as Promise<InspeccionMovil>;
}

/* ------------------------------------------------------------------ */
/* Bitacora / Cierre / Reapertura                                       */
/* ------------------------------------------------------------------ */

export interface Bitacora {
  guardia: Guardia;
  personal: AsignacionGuardia[];
  marcacionesAsistencia: Array<Record<string, unknown> & { nombreCompleto: string; timestampMarcacion: string; tipoMarcacion: string }>;
  servicios: Array<Record<string, unknown> & { id: string; numeroServicio: string; fechaHoraAviso: string; estado: string }>;
  eventos: Array<Record<string, unknown> & { id: string; nombre: string; fechaInicio: string; fechaFin: string }>;
  prestamosEquipo: Array<Record<string, unknown> & { id: string; equipoId: string; nombreCompleto: string | null; fechaPrestamo: string }>;
  pernoctes: Pernocte[];
  inspeccionesEstacion: InspeccionEstacion[];
  inspeccionesMovil: InspeccionMovil[];
  novedades: NovedadGuardia[];
}

export async function cargarBitacora(guardiaId: string) {
  const res = await apiFetch(`/guardias/${guardiaId}/bitacora`);
  if (!res.ok) throw new Error('No se pudo cargar la bitacora');
  return res.json() as Promise<Bitacora>;
}

export async function cerrarGuardia(guardiaId: string, observacion?: string, responsableId?: string) {
  const res = await apiFetch(`/guardias/${guardiaId}/cerrar`, { method: 'POST', body: JSON.stringify({ observacion, responsableId }) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cerrar la guardia'));
  return res.json() as Promise<Guardia>;
}

export async function reabrirGuardia(guardiaId: string, motivo: string) {
  const res = await apiFetch(`/guardias/${guardiaId}/reabrir`, { method: 'POST', body: JSON.stringify({ motivo }) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo reabrir la guardia'));
  return res.json() as Promise<Guardia>;
}

export async function reemplazarAsignacionGuardia(guardiaId: string, asignacionId: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/guardias/${guardiaId}/asignaciones/${asignacionId}/reemplazar`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo reemplazar la asignacion'));
  return res.json() as Promise<AsignacionGuardia>;
}

/* ------------------------------------------------------------------ */
/* Ordenes de Guardia                                                   */
/* ------------------------------------------------------------------ */

export type EstadoOrdenGuardia = 'BORRADOR' | 'REVISADA' | 'APROBADA' | 'PUBLICADA' | 'ANULADA';

export interface OrdenGuardia {
  id: string;
  anio: number;
  mes: number;
  numero: number;
  periodoDesde: string;
  periodoHasta: string;
  fechaEmision: string;
  estado: EstadoOrdenGuardia;
  contenidoJson: string;
  generadoEn: string;
  generadoPor: string | null;
  revisadaEn: string | null;
  revisadaPor: string | null;
  aprobadaEn: string | null;
  aprobadaPor: string | null;
  publicadaEn: string | null;
  publicadaPor: string | null;
  anuladaEn: string | null;
  anuladaPor: string | null;
  anuladaMotivo: string | null;
  archivoPdfUrl: string | null;
  archivoDocxUrl: string | null;
  observaciones: string | null;
}

export interface PersonaResumenOrden {
  bomberoId: string;
  nombreCompleto: string;
  rango: string | null;
}

export interface OrdenGuardiaSnapshot {
  numero: number;
  anio: number;
  numeroFormateado: string;
  mes: number;
  nombreMes: string;
  periodoDesde: string;
  periodoHasta: string;
  fechaEmision: string;
  generadoEn: string;
  institucional: {
    nombreInstitucion: string;
    lineasDestacadas: Array<{ texto: string; tipo: 'SUBTITULO' | 'DISTINCION' | 'OTRO' }>;
    direccion: string | null;
    telefono: string | null;
    email: string | null;
    sitioWeb: string | null;
    personeriaJuridica: string | null;
    fechaFundacion: string | null;
    logoIzquierdaUrl: string | null;
    logoDerechaUrl: string | null;
    piePaginaInstitucional: { texto: string | null; mostrarNumeroPagina: boolean; mostrarGeneradoSigbo: boolean };
  };
  introduccion: { textoRenderizado: string; reglaOficialTexto: string; reglaChoferTexto: string };
  gruposRotativos: Array<{
    grupoId: string;
    nombre: string;
    diaSemana: string | null;
    oficialACargo: PersonaResumenOrden | null;
    chofer: PersonaResumenOrden | null;
    integrantes: Array<PersonaResumenOrden & { rolGrupo: string }>;
    fechasDelPeriodo: string[];
  }>;
  rostersIndividuales: Array<{
    esquemaId: string;
    esquemaNombre: string;
    horaInicio: string;
    horaFin: string;
    diasSemanaCsv: string | null;
    fechas: Array<{ fecha: string; diaSemana: string; asignaciones: Array<PersonaResumenOrden & { rol: string | null }> }>;
  }>;
  guardiasEspeciales: Array<{
    esquemaId: string;
    modalidadTexto: string;
    ocurrencias: Array<{ fecha: string; asignaciones: PersonaResumenOrden[] }>;
  }>;
  conductoresDisponibles: Array<PersonaResumenOrden & { telefono: string | null }>;
  piePagina: { texto: string };
  firmantes: Array<{
    cargoId: string | null;
    etiquetaCargo: string;
    bomberoId: string | null;
    nombreCompleto: string | null;
    rango: string | null;
    firmaDigitalUrl: string | null;
    advertencia: string | null;
  }>;
}

export interface OrdenGuardiaConfiguracion {
  id: string;
  tituloDocumento: string;
  textoIntroPlantilla: string | null;
  reglaTextoOficial: string | null;
  reglaTextoChofer: string | null;
  exigirRangoIgualOSuperiorOficial: boolean;
  textoPie: string | null;
  firmante1CargoId: string | null;
  firmante1Etiqueta: string | null;
  firmante2CargoId: string | null;
  firmante2Etiqueta: string | null;
  actualizadoEn: string;
  actualizadoPor: string | null;
}

export interface OrdenGuardiaModificacion {
  id: string;
  ordenId: string;
  campo: string;
  descripcion: string;
  valorAnterior: string | null;
  valorNuevo: string | null;
  motivo: string;
  registradoEn: string;
  registradoPor: string;
}

export async function cargarOrdenesGuardia(anio?: number, mes?: number, estado?: string) {
  const params = new URLSearchParams();
  if (anio) params.set('anio', String(anio));
  if (mes) params.set('mes', String(mes));
  if (estado) params.set('estado', estado);
  const res = await apiFetch(`/guardias/ordenes?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de ordenes');
  return res.json() as Promise<OrdenGuardia[]>;
}

export async function cargarOrdenGuardia(id: string) {
  const res = await apiFetch(`/guardias/ordenes/${id}`);
  if (!res.ok) throw new Error('No se pudo cargar la orden');
  return res.json() as Promise<OrdenGuardia>;
}

export async function crearOrdenGuardia(payload: Record<string, unknown>) {
  const res = await apiFetch('/guardias/ordenes', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear la orden'));
  return res.json() as Promise<OrdenGuardia>;
}

export async function regenerarPreviewOrden(id: string) {
  const res = await apiFetch(`/guardias/ordenes/${id}/regenerar-preview`, { method: 'POST' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo regenerar la vista previa'));
  return res.json() as Promise<OrdenGuardia>;
}

export async function generarDocumentosOrden(id: string) {
  const res = await apiFetch(`/guardias/ordenes/${id}/generar-documentos`, { method: 'POST' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudieron generar los documentos'));
  return res.json() as Promise<OrdenGuardia>;
}

export async function revisarOrden(id: string) {
  const res = await apiFetch(`/guardias/ordenes/${id}/revisar`, { method: 'POST' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo pasar a revisada'));
  return res.json() as Promise<OrdenGuardia>;
}

export async function volverABorradorOrden(id: string) {
  const res = await apiFetch(`/guardias/ordenes/${id}/volver-borrador`, { method: 'POST' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo volver a borrador'));
  return res.json() as Promise<OrdenGuardia>;
}

export async function aprobarOrden(id: string) {
  const res = await apiFetch(`/guardias/ordenes/${id}/aprobar`, { method: 'POST' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo aprobar la orden'));
  return res.json() as Promise<OrdenGuardia>;
}

export async function publicarOrden(id: string) {
  const res = await apiFetch(`/guardias/ordenes/${id}/publicar`, { method: 'POST' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo publicar la orden'));
  return res.json() as Promise<OrdenGuardia>;
}

export async function anularOrden(id: string, motivo: string) {
  const res = await apiFetch(`/guardias/ordenes/${id}/anular`, { method: 'POST', body: JSON.stringify({ motivo }) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo anular la orden'));
  return res.json() as Promise<OrdenGuardia>;
}

export async function listarModificacionesOrden(id: string) {
  const res = await apiFetch(`/guardias/ordenes/${id}/modificaciones`);
  if (!res.ok) throw new Error('No se pudo cargar el historial de modificaciones');
  return res.json() as Promise<OrdenGuardiaModificacion[]>;
}

export async function registrarModificacionOrden(id: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/guardias/ordenes/${id}/modificaciones`, { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo registrar la modificacion'));
  return res.json() as Promise<OrdenGuardiaModificacion>;
}

export async function cargarConfiguracionOrdenes() {
  const res = await apiFetch('/guardias/ordenes/configuracion');
  if (!res.ok) throw new Error('No se pudo cargar la configuracion');
  return res.json() as Promise<OrdenGuardiaConfiguracion>;
}

export async function actualizarConfiguracionOrdenes(payload: Record<string, unknown>) {
  const res = await apiFetch('/guardias/ordenes/configuracion', { method: 'PUT', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar la configuracion'));
  return res.json() as Promise<OrdenGuardiaConfiguracion>;
}
