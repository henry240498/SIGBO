import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import type {
  EstadoDespacho,
  EstadoServicio,
  EstadoSolicitudRecurso,
  FaseOperativa,
  ResultadoIncidente,
} from '../../shared/entities';

/** Orden del flujo operativo; las fases automáticas solo avanzan. */
export const FASES: readonly FaseOperativa[] = [
  'RECIBIDO', 'EVALUACION', 'DESPACHADO', 'EN_CAMINO', 'EN_LUGAR',
  'OPERANDO', 'CONTROLADO', 'RETORNO', 'DISPONIBLE', 'CERRADO',
];
export const FASES_ACTIVAS: readonly FaseOperativa[] = FASES.filter((f) => f !== 'CERRADO');
export const RESULTADOS: readonly ResultadoIncidente[] = [
  'CONTROLADO', 'RESUELTO', 'FALSA_ALARMA', 'CANCELADO', 'DERIVADO', 'NO_ATENDIDO', 'SIN_ACCESO', 'SIN_INTERVENCION',
];
/** Un despacho en estos estados sigue fuera del cuartel. */
export const DESPACHO_ACTIVO: readonly EstadoDespacho[] = ['DESPACHADO', 'EN_SERVICIO', 'REGRESANDO'];
export const ordenFase = (fase: FaseOperativa) => FASES.indexOf(fase);

/** Estado heredado que se deriva de la fase operativa. */
export function estadoDesdeFase(fase: FaseOperativa, resultado: ResultadoIncidente | null): EstadoServicio {
  switch (fase) {
    case 'RECIBIDO': case 'EVALUACION': return 'REGISTRADO';
    case 'DESPACHADO': case 'EN_CAMINO': return 'DESPACHADO';
    case 'CERRADO': return resultado === 'CANCELADO' ? 'CANCELADO' : 'FINALIZADO';
    default: return 'EN_CURSO';
  }
}

export type HechoAutomatico = 'DESPACHO_CREADO' | 'SALIDA' | 'LLEGADA' | 'ACCION_OPERATIVA' | 'DESPACHOS_CAMBIARON';
export function faseAutomatica(
  actual: FaseOperativa,
  hecho: HechoAutomatico,
  despachos: ReadonlyArray<{ estado: EstadoDespacho }> = [],
): FaseOperativa | null {
  if (actual === 'CERRADO') return null;
  const avanzarA = (destino: FaseOperativa) => ordenFase(destino) > ordenFase(actual) ? destino : null;
  switch (hecho) {
    case 'DESPACHO_CREADO': return avanzarA('DESPACHADO');
    case 'SALIDA': return avanzarA('EN_CAMINO');
    case 'LLEGADA': return avanzarA('EN_LUGAR');
    case 'ACCION_OPERATIVA': return actual === 'EN_LUGAR' ? 'OPERANDO' : null;
    case 'DESPACHOS_CAMBIARON': {
      if (ordenFase(actual) < ordenFase('EN_LUGAR')) return null;
      const activos = despachos.filter((d) => DESPACHO_ACTIVO.includes(d.estado));
      if (activos.length === 0) return avanzarA('DISPONIBLE');
      const noRetornan = activos.some((d) => d.estado === 'DESPACHADO' || d.estado === 'EN_SERVICIO');
      return noRetornan ? null : avanzarA('RETORNO');
    }
  }
}

export type AccionFase = 'EVALUACION' | 'OPERANDO' | 'CONTROLADO' | 'REACTIVADO';
const MANUALES: Record<AccionFase, { desde: FaseOperativa[]; hacia: FaseOperativa; permiso: string }> = {
  EVALUACION: { desde: ['RECIBIDO'], hacia: 'EVALUACION', permiso: 'servicios:despachar' },
  OPERANDO: { desde: ['EN_LUGAR'], hacia: 'OPERANDO', permiso: 'servicios:comandar' },
  CONTROLADO: { desde: ['EN_LUGAR', 'OPERANDO'], hacia: 'CONTROLADO', permiso: 'servicios:comandar' },
  REACTIVADO: { desde: ['CONTROLADO'], hacia: 'OPERANDO', permiso: 'servicios:comandar' },
};
export const NOMBRE_FASE: Record<FaseOperativa, string> = {
  RECIBIDO: 'Recibido', EVALUACION: 'En evaluación', DESPACHADO: 'Despachado', EN_CAMINO: 'En camino',
  EN_LUGAR: 'En el lugar', OPERANDO: 'Operando', CONTROLADO: 'Controlado', RETORNO: 'En retorno',
  DISPONIBLE: 'Unidades disponibles', CERRADO: 'Cerrado',
};
export const NOMBRE_RESULTADO: Record<ResultadoIncidente, string> = {
  CONTROLADO: 'Controlado', RESUELTO: 'Resuelto', FALSA_ALARMA: 'Falsa alarma', CANCELADO: 'Cancelado',
  DERIVADO: 'Derivado', NO_ATENDIDO: 'No atendido', SIN_ACCESO: 'Sin acceso', SIN_INTERVENCION: 'Sin intervención',
};
export function transicionManual(actual: FaseOperativa, accion: AccionFase, permisos: readonly string[]): FaseOperativa {
  const regla = MANUALES[accion];
  if (!regla) throw new BadRequestException(`Acción de fase desconocida: ${accion}.`);
  if (!permisos.includes(regla.permiso)) throw new ForbiddenException(`Hace falta el permiso ${regla.permiso}.`);
  if (!regla.desde.includes(actual)) {
    throw new ConflictException(`El incidente está ${NOMBRE_FASE[actual]}; esta acción solo aplica desde ${regla.desde.map((f) => NOMBRE_FASE[f]).join(' o ')}.`);
  }
  return regla.hacia;
}

/** Antes del primer despacho decide la central; luego, el comando. */
export function exigirPermisoResultado(fase: FaseOperativa, permisos: readonly string[]): void {
  const permiso = ordenFase(fase) < ordenFase('DESPACHADO') ? 'servicios:despachar' : 'servicios:comandar';
  if (!permisos.includes(permiso)) throw new ForbiddenException(`Hace falta el permiso ${permiso}.`);
}

/** Un resultado alternativo cierra sin móviles afuera; si siguen fuera, inicia el retorno. */
export function faseTrasResultado(actual: FaseOperativa, despachosActivos: number): FaseOperativa | null {
  if (actual === 'CERRADO') throw new ConflictException('El incidente ya está cerrado.');
  if (despachosActivos > 0) return ordenFase(actual) < ordenFase('RETORNO') ? 'RETORNO' : null;
  return 'CERRADO';
}

export function validarCierre(actual: FaseOperativa, despachosActivos: number): void {
  if (actual === 'CERRADO') throw new ConflictException('El incidente ya está cerrado.');
  if (despachosActivos > 0) {
    throw new ConflictException(`No se puede cerrar: ${despachosActivos === 1 ? 'hay un móvil' : `hay ${despachosActivos} móviles`} todavía afuera. Registrá su regreso primero.`);
  }
}

export interface EventoCondicion { tipo: string; datos: string | null }
function leer(datos: string | null): { codigo?: string; resueltas?: string[] } {
  if (!datos) return {};
  try {
    const valor: unknown = JSON.parse(datos);
    return valor && typeof valor === 'object' ? valor as { codigo?: string; resueltas?: string[] } : {};
  } catch { return {}; }
}
/** Pliega en orden los eventos que marcan o resuelven condiciones. */
export function condicionesActivas(eventos: readonly EventoCondicion[]): Set<string> {
  const activas = new Set<string>();
  for (const evento of eventos) {
    if (evento.tipo !== 'SITUACION_MARCADA' && evento.tipo !== 'SITUACION_RESUELTA') continue;
    const datos = leer(evento.datos);
    if (!datos.codigo) continue;
    if (evento.tipo === 'SITUACION_MARCADA') {
      for (const codigo of datos.resueltas ?? []) activas.delete(codigo);
      activas.add(datos.codigo);
    } else activas.delete(datos.codigo);
  }
  return activas;
}
export function excluyentesDe(
  codigo: string,
  catalogo: ReadonlyArray<{ codigo: string; grupoExcluyente: string | null }>,
  activas: ReadonlySet<string>,
): string[] {
  const grupo = catalogo.find((c) => c.codigo === codigo)?.grupoExcluyente;
  if (!grupo) return [];
  return catalogo.filter((c) => c.codigo !== codigo && c.grupoExcluyente === grupo && activas.has(c.codigo)).map((c) => c.codigo);
}

export const CICLO_RECURSO: readonly EstadoSolicitudRecurso[] = ['SOLICITADO', 'APROBADO', 'DESPACHADO', 'EN_CAMINO', 'EN_USO', 'LIBERADO'];
const FINALES_RECURSO: readonly EstadoSolicitudRecurso[] = ['LIBERADO', 'RECHAZADO', 'CANCELADO'];
/** Avanza (puede saltar pasos), nunca retrocede; rechazar o cancelar termina el pedido. */
export function validarEstadoRecurso(actual: EstadoSolicitudRecurso, nuevo: EstadoSolicitudRecurso): void {
  if (FINALES_RECURSO.includes(actual)) throw new ConflictException(`El pedido ya está ${actual.toLowerCase()}.`);
  if (nuevo === 'RECHAZADO' || nuevo === 'CANCELADO') return;
  if (CICLO_RECURSO.indexOf(nuevo) <= CICLO_RECURSO.indexOf(actual)) {
    throw new ConflictException(`El pedido está ${actual.toLowerCase()}; no puede volver a ${nuevo.toLowerCase()}.`);
  }
}
/** Indica si la última emergencia sigue sin atención. */
export function emergenciaActiva(eventos: ReadonlyArray<{ tipo: string }>): boolean {
  let activa = false;
  for (const evento of eventos) {
    if (evento.tipo === 'EMERGENCIA') activa = true;
    else if (evento.tipo === 'EMERGENCIA_ATENDIDA') activa = false;
  }
  return activa;
}
export const etiquetaMovil = (movil: { numeroInterno: string }) => `Móvil ${movil.numeroInterno}`;
/** Nombre y apellido, con el número institucional cuando está disponible. */
export function nombreBombero(b?: { nombre: string; apellido: string; numeroBombero?: string | null } | null): string {
  if (!b) return 'Persona desconocida';
  return `${b.nombre} ${b.apellido}`.trim() + (b.numeroBombero ? ` (${b.numeroBombero})` : '');
}

export type PoliticaHorasServicio = 'MAS_CERCANA' | 'HORA_INICIADA' | 'HORAS_COMPLETAS';
/** Convierte minutos enteros según política institucional; no representa fracciones de minuto. */
export function horasDeServicio(minutos: number, politica: PoliticaHorasServicio = 'MAS_CERCANA'): number {
  const acotados = Math.max(0, Math.trunc(minutos));
  switch (politica) {
    case 'MAS_CERCANA': return Math.round(acotados / 60);
    case 'HORA_INICIADA': return Math.ceil(acotados / 60);
    case 'HORAS_COMPLETAS': return Math.floor(acotados / 60);
    default: throw new BadRequestException(`Política de horas de servicio desconocida: ${politica}.`);
  }
}
