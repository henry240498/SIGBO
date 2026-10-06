import { apiFetch } from './api';
import { JSON_HEADERS, leer } from './flota';

export interface Instalacion {
  id: string;
  nombre: string;
  capacidad: number | null;
  descripcion: string | null;
  activo: boolean;
}

export type EstadoReserva = 'SOLICITADA' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA';

export interface Reserva {
  id: string;
  instalacionId: string;
  titulo: string;
  solicitanteNombre: string;
  contacto: string | null;
  personas: number | null;
  inicio: string;
  fin: string;
  estado: EstadoReserva;
  motivoDecision: string | null;
  creadoPor: string;
  conflictoConAprobada?: boolean;
}

export type ResultadoInspeccion = 'APROBADO' | 'CON_OBSERVACIONES' | 'RECHAZADO';

export interface EstadoEstablecimiento {
  establecimiento: string;
  direccion: string;
  estado: 'VIGENTE' | 'POR_VENCER' | 'VENCIDO' | 'PENDIENTE';
  ultimaInspeccion: string;
  resultado: ResultadoInspeccion;
  certificadoNumero: string | null;
  certificadoVence: string | null;
  diasRestantes: number | null;
}

export const cargarInstalaciones = async () => leer<Instalacion[]>(await apiFetch('/reservas/instalaciones'));

export const crearInstalacion = async (d: { nombre: string; capacidad?: number; descripcion?: string }) =>
  leer<Instalacion>(await apiFetch('/reservas/instalaciones', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(d) }));

export const cargarReservas = async (estado?: EstadoReserva) =>
  leer<Reserva[]>(await apiFetch(`/reservas${estado ? `?estado=${estado}` : ''}`));

export const solicitarReserva = async (d: {
  instalacionId: string;
  titulo: string;
  solicitanteNombre: string;
  inicio: string;
  fin: string;
  contacto?: string;
  personas?: number;
}) => leer<Reserva>(await apiFetch('/reservas', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(d) }));

export const decidirReserva = async (id: string, decision: 'APROBAR' | 'RECHAZAR', motivo?: string) =>
  leer<Reserva>(await apiFetch(`/reservas/${id}/decision`, { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify({ decision, motivo }) }));

export const cancelarReserva = async (id: string, motivo?: string) =>
  leer<Reserva>(await apiFetch(`/reservas/${id}/cancelar`, { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify({ motivo }) }));

export const cargarEstadoPrevencion = async (dias = 30) =>
  leer<EstadoEstablecimiento[]>(await apiFetch(`/prevencion/estado?dias=${dias}`));

export const registrarInspeccion = async (d: {
  establecimiento: string;
  direccion: string;
  fecha: string;
  resultado: ResultadoInspeccion;
  observaciones?: string;
  certificadoNumero?: string;
  certificadoVence?: string;
}) => leer(await apiFetch('/prevencion/inspecciones', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(d) }));
