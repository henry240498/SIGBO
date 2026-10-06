import { apiFetch } from './api';
import { JSON_HEADERS, leer } from './flota';

export type OrigenVencimiento = 'APTITUD' | 'CERTIFICACION' | 'AUTORIZACION_VEHICULO' | 'EQUIPO';

export interface VencimientoPersonal {
  origen: OrigenVencimiento;
  bomberoId: string;
  bombero: string;
  descripcion: string;
  fecha: string;
  vencido: boolean;
  diasRestantes: number;
}

export interface LimitesHoras {
  horasMaximasPeriodo: number;
  periodoDias: number;
  descansoMinimoHoras: number;
}

export interface ResumenHorasBombero {
  bomberoId: string;
  nombre: string;
  guardias: number;
  totalHoras: number;
  maximoEnPeriodo: number | null;
  excedeLimite: boolean | null;
  violacionesDescanso: Array<{ guardiaAnteriorId: string; guardiaSiguienteId: string; descansoHoras: number }>;
}

export interface ResumenHoras {
  desde: string;
  hasta: string;
  limites: LimitesHoras | null;
  conAlertas: number;
  bomberos: ResumenHorasBombero[];
}

export interface PuntoFichaje {
  id: string;
  nombre: string;
  activo: boolean;
}

export interface FichajeDelDia {
  id: string;
  usuario: string;
  tipo: 'ENTRADA' | 'SALIDA';
  registradoEn: string;
}

export interface ResultadoEscaneo {
  duplicado: boolean;
  tipo: 'ENTRADA' | 'SALIDA';
  registradoEn: string;
  punto: string;
}

export const ORIGEN_ETIQUETA: Record<OrigenVencimiento, string> = {
  APTITUD: 'Aptitud',
  CERTIFICACION: 'Certificación',
  AUTORIZACION_VEHICULO: 'Conducción',
  EQUIPO: 'Equipo',
};

export const cargarVencimientosPersonal = async (dias: number) =>
  leer<VencimientoPersonal[]>(await apiFetch(`/aptitudes/vencimientos?dias=${dias}`));

export const crearAptitud = async (d: {
  bomberoId: string;
  categoria: 'MEDICA' | 'LICENCIA' | 'OTRA';
  tipo: string;
  venceEn: string;
  emitidoEn?: string;
  observacion?: string;
}) => leer(await apiFetch('/aptitudes', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(d) }));

export const cargarResumenHoras = async (desde: string, hasta: string) =>
  leer<ResumenHoras>(await apiFetch(`/horas-servicio?desde=${desde}&hasta=${hasta}`));

export const cargarLimitesHoras = async () => leer<LimitesHoras | null>(await apiFetch('/horas-servicio/limites'));

export const fijarLimitesHoras = async (l: LimitesHoras) =>
  leer(await apiFetch('/horas-servicio/limites', { method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify(l) }));

export const cargarPuntosFichaje = async () => leer<PuntoFichaje[]>(await apiFetch('/fichaje/puntos'));

export const crearPuntoFichaje = async (nombre: string) =>
  leer<PuntoFichaje & { token: string }>(await apiFetch('/fichaje/puntos', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify({ nombre }) }));

export const regenerarPuntoFichaje = async (id: string) =>
  leer<PuntoFichaje & { token: string }>(await apiFetch(`/fichaje/puntos/${id}/regenerar`, { method: 'POST' }));

export const actualizarPuntoFichaje = async (id: string, cambios: { activo?: boolean; nombre?: string }) =>
  leer<PuntoFichaje>(await apiFetch(`/fichaje/puntos/${id}`, { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify(cambios) }));

export const cargarFichajesDelDia = async (fecha: string) => leer<FichajeDelDia[]>(await apiFetch(`/fichaje?fecha=${fecha}`));

export const escanearFichaje = async (token: string) =>
  leer<ResultadoEscaneo>(await apiFetch('/fichaje/escanear', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify({ token }) }));

/** Direccion que lleva el QR: abre la pagina de fichaje con el token. */
export const urlDeFichaje = (token: string) => `${window.location.origin}/fichar?t=${encodeURIComponent(token)}`;
