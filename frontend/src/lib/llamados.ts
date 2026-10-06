import { apiFetch } from './api';
import { JSON_HEADERS, leer } from './flota';

export type EstadoLlamado = 'RECIBIDO' | 'EN_ATENCION' | 'CERRADO';

export interface Llamado {
  id: string;
  recibidoEn: string;
  medio: string;
  llamanteNombre: string | null;
  llamanteTelefono: string | null;
  direccion: string;
  referencia: string | null;
  descripcion: string | null;
  estado: EstadoLlamado;
  servicioId: string | null;
  motivoCierre: string | null;
}

export interface NuevoLlamado {
  medio: string;
  direccion: string;
  llamanteNombre?: string;
  llamanteTelefono?: string;
  referencia?: string;
  descripcion?: string;
}

export interface Convocatoria {
  id: string;
  mensaje: string;
  estado: 'ABIERTA' | 'CERRADA';
  llamadoId: string | null;
  creadoEn: string;
  cerradaEn: string | null;
}

export interface RespuestaConvocatoria {
  id: string;
  usuarioNombre: string;
  respuesta: 'VOY' | 'NO_PUEDO';
  etaMinutos: number | null;
  respondidoEn: string;
  motivo: string | null;
  enCaminoEn: string | null;
  canceladaEn: string | null;
}

export interface EventoRespuestaConvocatoria {
  id: string;
  usuarioNombre: string;
  accion: 'ACEPTAR' | 'RECHAZAR' | 'CAMBIAR_RESPUESTA' | 'EN_CAMINO' | 'CANCELAR_ASISTENCIA' | 'LLEGAR';
  respuesta: 'VOY' | 'NO_PUEDO' | null;
  motivo: string | null;
  ocurridoEn: string;
}

export interface DetalleConvocatoria extends Convocatoria {
  respuestas: RespuestaConvocatoria[];
  eventos: EventoRespuestaConvocatoria[];
  totales: { voy: number; noPuedo: number };
}

/** Medios habituales; el campo es de texto libre y el cuartel puede usar otros. */
export const MEDIOS_LLAMADO = ['Radio', 'Teléfono', 'Presencial', '911 / Emergencias'];

export async function cargarLlamados(estado?: EstadoLlamado) {
  const q = estado ? `?estado=${estado}` : '';
  return leer<Llamado[]>(await apiFetch(`/llamados${q}`));
}

export async function crearLlamado(datos: NuevoLlamado) {
  return leer<Llamado>(await apiFetch('/llamados', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(datos) }));
}

export async function cambiarEstadoLlamado(id: string, estado: 'EN_ATENCION' | 'CERRADO', motivo?: string) {
  return leer<Llamado>(
    await apiFetch(`/llamados/${id}/estado`, { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify({ estado, motivo }) }),
  );
}

export async function vincularServicioALlamado(id: string, servicioId: string) {
  return leer<Llamado>(
    await apiFetch(`/llamados/${id}/servicio`, { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify({ servicioId }) }),
  );
}

export async function cargarConvocatorias() {
  return leer<Convocatoria[]>(await apiFetch('/convocatorias'));
}

export async function cargarDetalleConvocatoria(id: string) {
  return leer<DetalleConvocatoria>(await apiFetch(`/convocatorias/${id}`));
}

export async function crearConvocatoria(mensaje: string, llamadoId?: string) {
  return leer<Convocatoria>(
    await apiFetch('/convocatorias', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify({ mensaje, llamadoId }) }),
  );
}

export async function cerrarConvocatoria(id: string) {
  return leer<Convocatoria>(await apiFetch(`/convocatorias/${id}/cerrar`, { method: 'PATCH' }));
}
