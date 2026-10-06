import { apiFetch } from './api';
import { JSON_HEADERS, leer } from './flota';

export type EstadoHidrante = 'OPERATIVO' | 'FUERA_SERVICIO' | 'SIN_VERIFICAR';
export type NivelRiesgo = 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';

export interface Hidrante {
  id: string;
  codigo: string;
  tipo: string | null;
  direccion: string;
  referencia: string | null;
  latitud: number;
  longitud: number;
  estado: EstadoHidrante;
  caudalLpm: number | null;
  ultimaInspeccion: string | null;
  observaciones: string | null;
  activo: boolean;
}

export interface PuntoRiesgo {
  id: string;
  nombre: string;
  categoria: string | null;
  nivelRiesgo: NivelRiesgo;
  direccion: string;
  latitud: number;
  longitud: number;
  contactoNombre: string | null;
  contactoTelefono: string | null;
  descripcion: string | null;
  activo: boolean;
}

export interface Preplan {
  id: string;
  version: number;
  titulo: string;
  contenido: string;
  vigente: boolean;
  creadoEn: string;
}

export const cargarHidrantes = async () => leer<Hidrante[]>(await apiFetch('/cartografia/hidrantes'));
export const cargarPuntosRiesgo = async () => leer<PuntoRiesgo[]>(await apiFetch('/cartografia/puntos-riesgo'));

export const crearHidrante = async (d: Partial<Hidrante> & { codigo: string; direccion: string; latitud: number; longitud: number }) =>
  leer<Hidrante>(await apiFetch('/cartografia/hidrantes', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(d) }));

export const actualizarHidrante = async (id: string, d: Partial<Hidrante>) =>
  leer<Hidrante>(await apiFetch(`/cartografia/hidrantes/${id}`, { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify(d) }));

export const crearPuntoRiesgo = async (d: Partial<PuntoRiesgo> & { nombre: string; direccion: string; latitud: number; longitud: number }) =>
  leer<PuntoRiesgo>(await apiFetch('/cartografia/puntos-riesgo', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(d) }));

export const actualizarPuntoRiesgo = async (id: string, d: Partial<PuntoRiesgo>) =>
  leer<PuntoRiesgo>(await apiFetch(`/cartografia/puntos-riesgo/${id}`, { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify(d) }));

export const cargarPreplan = async (puntoId: string) =>
  leer<Preplan | null>(await apiFetch(`/cartografia/puntos-riesgo/${puntoId}/preplan`));

export const cargarHistorialPreplan = async (puntoId: string) =>
  leer<Preplan[]>(await apiFetch(`/cartografia/puntos-riesgo/${puntoId}/preplan/historial`));

export const guardarPreplan = async (puntoId: string, titulo: string, contenido: string) =>
  leer<Preplan>(
    await apiFetch(`/cartografia/puntos-riesgo/${puntoId}/preplan`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ titulo, contenido }),
    }),
  );
