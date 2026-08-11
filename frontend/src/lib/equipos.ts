import { apiFetch } from './api';
import { cargarParametros } from './parametros';

export type EstadoEquipo = 'OPERATIVO' | 'EN_MANTENIMIENTO' | 'DANIADO' | 'BAJA' | 'PRESTADO';
export const ESTADOS_EQUIPO: EstadoEquipo[] = ['OPERATIVO', 'EN_MANTENIMIENTO', 'DANIADO', 'BAJA', 'PRESTADO'];

export interface CategoriaEquipo {
  id: string;
  nombre: string;
  descripcion: string | null;
  padreId: string | null;
  activo: boolean;
  creadoEn: string;
}

export interface Equipo {
  id: string;
  categoriaId: string;
  codigoInterno: string;
  nombre: string;
  descripcion: string | null;
  marca: string | null;
  modelo: string | null;
  numeroSerie: string | null;
  estado: EstadoEquipo;
  ubicacion: string | null;
  responsableId: string | null;
  fechaCompra: string | null;
  fechaVencimiento: string | null;
  vidaUtilMeses: number | null;
  qrCode: string | null;
  vehiculoAsignadoId: string | null;
  ubicacionTipo: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface MantenimientoEquipo {
  id: string;
  equipoId: string;
  fecha: string;
  tipo: 'PREVENTIVO' | 'CORRECTIVO' | 'CALIBRACION';
  descripcion: string;
  costo: number | null;
  proveedor: string | null;
  tecnico: string | null;
  proximoMantenimiento: string | null;
  creadoEn: string;
}

export interface PrestamoEquipo {
  id: string;
  equipoId: string;
  bomberoId: string | null;
  servicioId: string | null;
  fechaPrestamo: string;
  fechaDevolucionComprometida: string | null;
  fechaDevolucion: string | null;
  estado: 'PRESTADO' | 'DEVUELTO' | 'EXTRAVIADO' | 'DANIADO';
  observaciones: string | null;
  creadoEn: string;
  equipoNombre?: string | null;
  equipoCodigoInterno?: string | null;
}

export interface EventoHistorialEquipo {
  tipo: 'PRESTAMO' | 'MANTENIMIENTO';
  fecha: string;
  detalle: string;
  registro: unknown;
}

const TIPOS_MANTENIMIENTO_EQUIPO = ['PREVENTIVO', 'CORRECTIVO', 'CALIBRACION'];
export { TIPOS_MANTENIMIENTO_EQUIPO };

export function cargarUbicacionesEquipo() {
  return cargarParametros('UBICACION_EQUIPO');
}

async function mensajeError(res: Response, porDefecto: string): Promise<string> {
  const body = await res.json().catch(() => ({}));
  return Array.isArray(body.message) ? body.message.join(', ') : body.message ?? porDefecto;
}

/* ------------------------------------------------------------------ */
/* Categorias                                                           */
/* ------------------------------------------------------------------ */

export async function cargarCategorias(q?: string, activo?: string) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (activo) params.set('activo', activo);
  const res = await apiFetch(`/equipos/categorias?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de categorias');
  return res.json() as Promise<CategoriaEquipo[]>;
}

export async function crearCategoria(payload: Record<string, unknown>) {
  const res = await apiFetch('/equipos/categorias', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear la categoria'));
  return res.json() as Promise<CategoriaEquipo>;
}

export async function actualizarCategoria(id: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/equipos/categorias/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar la categoria'));
  return res.json() as Promise<CategoriaEquipo>;
}

export async function eliminarCategoria(id: string) {
  const res = await apiFetch(`/equipos/categorias/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo eliminar la categoria'));
  return res.json();
}

/* ------------------------------------------------------------------ */
/* Equipos                                                              */
/* ------------------------------------------------------------------ */

export async function cargarEquipos(q?: string, categoriaId?: string, estado?: string) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (categoriaId) params.set('categoriaId', categoriaId);
  if (estado) params.set('estado', estado);
  const res = await apiFetch(`/equipos/equipos?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de equipos');
  return res.json() as Promise<Equipo[]>;
}

export async function cargarEquipo(id: string) {
  const res = await apiFetch(`/equipos/equipos/${id}`);
  if (!res.ok) throw new Error('No se pudo cargar el equipo');
  return res.json() as Promise<Equipo>;
}

export async function crearEquipo(payload: Record<string, unknown>) {
  const res = await apiFetch('/equipos/equipos', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear el equipo'));
  return res.json() as Promise<Equipo>;
}

export async function actualizarEquipo(id: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/equipos/equipos/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar el equipo'));
  return res.json() as Promise<Equipo>;
}

export async function eliminarEquipo(id: string) {
  const res = await apiFetch(`/equipos/equipos/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo eliminar el equipo'));
  return res.json();
}

export async function asignarMovil(equipoId: string, vehiculoId: string | null) {
  const res = await apiFetch(`/equipos/equipos/${equipoId}/asignar-movil`, {
    method: 'PATCH',
    body: JSON.stringify({ vehiculoId }),
  });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo asignar el movil'));
  return res.json() as Promise<Equipo>;
}

export async function cargarHistorialEquipo(id: string) {
  const res = await apiFetch(`/equipos/equipos/${id}/historial`);
  if (!res.ok) throw new Error('No se pudo cargar el historial');
  return res.json() as Promise<EventoHistorialEquipo[]>;
}

export async function cargarMantenimientosEquipo(equipoId: string) {
  const res = await apiFetch(`/equipos/equipos/${equipoId}/mantenimientos`);
  if (!res.ok) throw new Error('No se pudo cargar los mantenimientos');
  return res.json() as Promise<MantenimientoEquipo[]>;
}

export async function crearMantenimientoEquipo(equipoId: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/equipos/equipos/${equipoId}/mantenimientos`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo registrar el mantenimiento'));
  return res.json() as Promise<MantenimientoEquipo>;
}

/* ------------------------------------------------------------------ */
/* Prestamos (por bombero, ya existente en Personal)                    */
/* ------------------------------------------------------------------ */

export async function cargarPrestamosDeBombero(bomberoId: string) {
  const res = await apiFetch(`/personal/bomberos/${bomberoId}/equipamiento`);
  if (!res.ok) return [] as PrestamoEquipo[];
  return res.json() as Promise<PrestamoEquipo[]>;
}

export async function prestarEquipo(bomberoId: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/personal/bomberos/${bomberoId}/equipamiento`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo registrar el prestamo'));
  return res.json();
}

export async function devolverEquipo(prestamoId: string, observaciones?: string) {
  const res = await apiFetch(`/personal/bomberos/equipamiento/${prestamoId}/devolucion`, {
    method: 'PATCH',
    body: JSON.stringify({ observaciones }),
  });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo registrar la devolucion'));
  return res.json();
}
