import { BadRequestException, ConflictException } from '@nestjs/common';
import type {
  DisponibilidadExcepcion,
  DisponibilidadHorario,
  EntregaSolicitud,
  EstadoDestinatario,
  EstadoPersonal,
} from '../../shared/entities/despacho-operativo.entity';

/**
 * Reglas del despacho sin acceso a datos: asi se prueban a fondo y el servicio solo
 * orquesta. Dos ejes que NO se mezclan:
 *  - entrega: que paso al enviar (se pudo, o por que no);
 *  - estado: que hizo la persona despues.
 */

export type AccionRespuesta = 'ACEPTAR' | 'NO_PUEDO' | 'CANCELAR' | 'EN_CAMINO' | 'LLEGUE';

/** Maquina de estados de un destinatario. Lo que no figura aca no esta permitido. */
const TRANSICIONES: Record<EstadoDestinatario, Partial<Record<AccionRespuesta, EstadoDestinatario>>> = {
  PENDIENTE: { ACEPTAR: 'ACEPTO', NO_PUEDO: 'NO_PUEDE' },
  ACEPTO: { CANCELAR: 'CANCELO', EN_CAMINO: 'EN_CAMINO' },
  NO_PUEDE: { ACEPTAR: 'ACEPTO' },
  CANCELO: { ACEPTAR: 'ACEPTO' },
  EN_CAMINO: { LLEGUE: 'LLEGO', CANCELAR: 'CANCELO' },
  LLEGO: {},
};

const ETIQUETA_ESTADO: Record<EstadoDestinatario, string> = {
  PENDIENTE: 'sin responder',
  ACEPTO: 'aceptó',
  NO_PUEDE: 'no puede asistir',
  CANCELO: 'canceló su asistencia',
  EN_CAMINO: 'en camino',
  LLEGO: 'llegó',
};

export function siguienteEstado(actual: EstadoDestinatario, accion: AccionRespuesta): EstadoDestinatario {
  const destino = TRANSICIONES[actual]?.[accion];
  if (!destino) {
    throw new ConflictException(`No se puede ${textoAccion(accion)} estando ${ETIQUETA_ESTADO[actual]}.`);
  }
  return destino;
}

function textoAccion(a: AccionRespuesta): string {
  return { ACEPTAR: 'aceptar', NO_PUEDO: 'indicar que no puede asistir', CANCELAR: 'cancelar la asistencia', EN_CAMINO: 'salir en camino', LLEGUE: 'registrar la llegada' }[a];
}

/** "No puedo" siempre lleva motivo: el reglamento pide saber por que. */
export function exigirMotivo(accion: AccionRespuesta, motivo?: string | null): string | null {
  const m = (motivo ?? '').trim();
  if (accion === 'NO_PUEDO' && m.length < 2) throw new BadRequestException('Indique el motivo por el que no puede asistir.');
  return m ? m.slice(0, 200) : null;
}

/** Como cambia la disponibilidad de la persona segun lo que hace en una solicitud. */
export function estadoPersonalTras(accion: AccionRespuesta, actual: EstadoPersonal): EstadoPersonal | null {
  switch (accion) {
    case 'EN_CAMINO':
      return 'EN_CAMINO';
    case 'LLEGUE':
      return 'EN_SERVICIO';
    case 'CANCELAR':
      return actual === 'EN_CAMINO' || actual === 'EN_SERVICIO' ? 'AL_LLAMADO' : null;
    default:
      return null;
  }
}

// ---------------------------------------------------------------- horarios

const hhmm = (s: string | null | undefined) => String(s ?? '').slice(0, 5);
const dosDigitos = (n: number) => String(n).padStart(2, '0');
export const fechaLocal = (d: Date) => `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`;
const horaLocal = (d: Date) => `${dosDigitos(d.getHours())}:${dosDigitos(d.getMinutes())}`;
/** 1 = lunes ... 7 = domingo. */
export const diaSemana = (d: Date) => (d.getDay() === 0 ? 7 : d.getDay());

function enFranja(desde: string, hasta: string, hora: string): boolean {
  // una franja que cruza la medianoche (22:00-06:00) vale de 22:00 al fin del dia o desde el inicio hasta 06:00
  return desde <= hasta ? hora >= desde && hora < hasta : hora >= desde || hora < hasta;
}

/**
 * ¿Puede recibir llamados por horario?
 * 1) una excepcion que cubre este momento manda (disponible o no);
 * 2) sin excepcion, si la persona usa horario, debe caer en una de sus franjas del dia;
 * 3) si no usa horario, no hay restriccion de horario.
 */
export function disponiblePorHorario(
  usaHorario: boolean,
  horarios: Pick<DisponibilidadHorario, 'diaSemana' | 'horaDesde' | 'horaHasta'>[],
  excepciones: Pick<DisponibilidadExcepcion, 'fechaDesde' | 'fechaHasta' | 'disponible' | 'horaDesde' | 'horaHasta'>[],
  ahora: Date,
): boolean {
  const fecha = fechaLocal(ahora);
  const hora = horaLocal(ahora);
  const cubre = excepciones.filter(
    (e) =>
      String(e.fechaDesde).slice(0, 10) <= fecha &&
      fecha <= String(e.fechaHasta).slice(0, 10) &&
      (!e.horaDesde || !e.horaHasta || enFranja(hhmm(e.horaDesde), hhmm(e.horaHasta), hora)),
  );
  // si hay varias, la mas restrictiva gana: bloquear antes que habilitar
  if (cubre.some((e) => !e.disponible)) return false;
  if (cubre.some((e) => e.disponible)) return true;
  if (!usaHorario) return true;
  const dia = diaSemana(ahora);
  return horarios.some((h) => h.diaSemana === dia && enFranja(hhmm(h.horaDesde), hhmm(h.horaHasta), hora));
}

// ---------------------------------------------------------------- entrega

export interface PersonaParaEntrega {
  estado: EstadoPersonal;
  temporalHasta: Date | null;
  /** Resultado de disponiblePorHorario. */
  enHorario: boolean;
  enLinea: boolean;
}

/**
 * Decide si una alerta operativa se le puede enviar a la persona y, si no, POR QUE.
 * El orden importa: la causa que se registra es la primera que la deja afuera, y
 * "sin conexion" nunca tapa a "no disponible" (fue una decision de la persona).
 */
export function evaluarEntrega(p: PersonaParaEntrega, ahora: Date): EntregaSolicitud {
  if (p.estado === 'EN_CAMINO' || p.estado === 'EN_SERVICIO') return 'EN_SERVICIO';
  const temporal = p.estado === 'AL_LLAMADO' && p.temporalHasta !== null && p.temporalHasta.getTime() > ahora.getTime();
  if (p.estado === 'NO_DISPONIBLE') return 'NO_DISPONIBLE';
  if (!p.enHorario && !temporal) return 'FUERA_DE_HORARIO';
  if (!p.enLinea) return 'SIN_CONEXION';
  return 'ENVIADA';
}

/** Un temporal vencido equivale a NO_DISPONIBLE: la configuracion permanente no se tocó. */
export function estadoEfectivo(estado: EstadoPersonal, temporalHasta: Date | null, ahora: Date): EstadoPersonal {
  if (estado === 'AL_LLAMADO' && temporalHasta && temporalHasta.getTime() <= ahora.getTime()) return 'NO_DISPONIBLE';
  return estado;
}

/** Presencia: conectado ahora (stream abierto) o con actividad reciente. */
export const VENTANA_PRESENCIA_MS = 90_000;
export function estaEnLinea(conexionesAbiertas: number, ultimaActividad: Date | null, ahora: Date): boolean {
  if (conexionesAbiertas > 0) return true;
  return !!ultimaActividad && ahora.getTime() - ultimaActividad.getTime() < VENTANA_PRESENCIA_MS;
}

// ---------------------------------------------------------------- seguimiento

export interface DestinatarioResumen {
  usuarioId: string;
  usuarioNombre: string;
  entrega: EntregaSolicitud;
  estado: EstadoDestinatario;
  recibidaEn: Date | null;
  vistoTardeEn: Date | null;
  aceptadaEn: Date | null;
  enCaminoEn: Date | null;
  llegoEn: Date | null;
  canceladaEn: Date | null;
  motivo: string | null;
  ampliacion: boolean;
}

/**
 * Los grupos que ve quien coordina. Cada persona cae en UNO solo, y los motivos por los
 * que alguien no recibio la alerta no se mezclan entre si ni con "recibio y no respondio".
 */
export function agruparSeguimiento(dest: DestinatarioResumen[]) {
  const g = {
    aceptaron: [] as DestinatarioResumen[],
    enCamino: [] as DestinatarioResumen[],
    llegaron: [] as DestinatarioResumen[],
    noPueden: [] as DestinatarioResumen[],
    cancelaron: [] as DestinatarioResumen[],
    /** Les llego y todavia no contestaron. */
    sinResponder: [] as DestinatarioResumen[],
    /** Les llego, pero el dispositivo aun no confirmo la recepcion. */
    enviadasSinConfirmar: [] as DestinatarioResumen[],
    noRecibieron: {
      sinConexion: [] as DestinatarioResumen[],
      noDisponible: [] as DestinatarioResumen[],
      fueraDeHorario: [] as DestinatarioResumen[],
      enServicio: [] as DestinatarioResumen[],
      noHabilitadoChofer: [] as DestinatarioResumen[],
    },
  };
  for (const d of dest) {
    switch (d.estado) {
      case 'ACEPTO': g.aceptaron.push(d); continue;
      case 'EN_CAMINO': g.enCamino.push(d); continue;
      case 'LLEGO': g.llegaron.push(d); continue;
      case 'NO_PUEDE': g.noPueden.push(d); continue;
      case 'CANCELO': g.cancelaron.push(d); continue;
      default: break;
    }
    // sigue PENDIENTE: ¿le llego la alerta?
    if (d.entrega === 'ENVIADA') {
      (d.recibidaEn ? g.sinResponder : g.enviadasSinConfirmar).push(d);
    } else if (d.ampliacion) {
      g.sinResponder.push(d);
    } else if (d.entrega === 'SIN_CONEXION') g.noRecibieron.sinConexion.push(d);
    else if (d.entrega === 'NO_DISPONIBLE') g.noRecibieron.noDisponible.push(d);
    else if (d.entrega === 'FUERA_DE_HORARIO') g.noRecibieron.fueraDeHorario.push(d);
    else if (d.entrega === 'EN_SERVICIO') g.noRecibieron.enServicio.push(d);
    else g.noRecibieron.noHabilitadoChofer.push(d);
  }
  return g;
}

/** "Se solicita chofer para: Móvil 1 + Móvil 3", con la nota opcional al final. */
export function textoSolicitud(tipo: 'CHOFER' | 'PERSONAL' | 'RAPIDA', moviles: string[], nota: string | null): string {
  let base: string;
  if (tipo === 'CHOFER') base = moviles.length ? `Se solicita chofer para: ${moviles.join(' + ')}` : 'Se solicita chofer';
  else if (tipo === 'PERSONAL') base = 'Se solicita personal para servicio';
  else base = 'Solicitud rápida: se necesita personal';
  return nota && nota.trim() ? `${base} — ${nota.trim()}` : base;
}
