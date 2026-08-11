import { apiFetch } from './api';

export type EstadoVehiculo = 'OPERATIVO' | 'EN_MANTENIMIENTO' | 'FUERA_SERVICIO' | 'BAJA';
export const ESTADOS_VEHICULO: EstadoVehiculo[] = ['OPERATIVO', 'EN_MANTENIMIENTO', 'FUERA_SERVICIO', 'BAJA'];

export interface Vehiculo {
  id: string;
  numeroInterno: string;
  tipo: string;
  marca: string | null;
  modelo: string | null;
  anio: number | null;
  patente: string | null;
  color: string | null;
  numeroChasis: string | null;
  numeroMotor: string | null;
  capacidadCarga: number | null;
  capacidadPasajeros: number | null;
  kilometrajeActual: number;
  combustibleActual: number;
  estado: EstadoVehiculo;
  ubicacionActual: string | null;
  itvFecha: string | null;
  itvVencimiento: string | null;
  seguroFecha: string | null;
  seguroVencimiento: string | null;
  seguroEmpresa: string | null;
  seguroPoliza: string | null;
  qrCode: string | null;
  fechaBaja: string | null;
  motivoBaja: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface MantenimientoVehiculo {
  id: string;
  vehiculoId: string;
  tipo: 'PREVENTIVO' | 'CORRECTIVO' | 'EMERGENCIA' | 'ITV' | 'REPARACION';
  fecha: string;
  descripcion: string;
  costo: number | null;
  kilometraje: number | null;
  taller: string | null;
  responsable: string | null;
  proximoMantenimiento: string | null;
  creadoEn: string;
}

export interface ConsumoCombustible {
  id: string;
  vehiculoId: string;
  fecha: string;
  galones: number;
  kilometrajeActual: number;
  tipoCombustible: string;
  costo: number | null;
  proveedor: string | null;
  factura: string | null;
  creadoEn: string;
}

export interface EventoHistorialVehiculo {
  tipo: 'MANTENIMIENTO' | 'COMBUSTIBLE' | 'SERVICIO';
  fecha: string;
  detalle: string;
  registro: unknown;
}

export interface ChecklistItemVehiculo {
  id: string;
  tipoVehiculo: string | null;
  nombre: string;
  categoria: 'MECANICA' | 'EQUIPAMIENTO' | 'OTRO';
  orden: number;
  activo: boolean;
}

const TIPOS_MANTENIMIENTO = ['PREVENTIVO', 'CORRECTIVO', 'EMERGENCIA', 'ITV', 'REPARACION'];
export { TIPOS_MANTENIMIENTO };

async function mensajeError(res: Response, porDefecto: string): Promise<string> {
  const body = await res.json().catch(() => ({}));
  return Array.isArray(body.message) ? body.message.join(', ') : body.message ?? porDefecto;
}

export async function cargarVehiculos(estado?: string) {
  const params = new URLSearchParams();
  if (estado) params.set('estado', estado);
  const res = await apiFetch(`/vehiculos/vehiculos?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de vehiculos');
  return res.json() as Promise<Vehiculo[]>;
}

export async function cargarVehiculo(id: string) {
  const res = await apiFetch(`/vehiculos/vehiculos/${id}`);
  if (!res.ok) throw new Error('No se pudo cargar el vehiculo');
  return res.json() as Promise<Vehiculo>;
}

export async function crearVehiculo(payload: Record<string, unknown>) {
  const res = await apiFetch('/vehiculos/vehiculos', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear el vehiculo'));
  return res.json() as Promise<Vehiculo>;
}

export async function actualizarVehiculo(id: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/vehiculos/vehiculos/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar el vehiculo'));
  return res.json() as Promise<Vehiculo>;
}

export async function darBajaVehiculo(id: string, motivoBaja?: string) {
  const res = await apiFetch(`/vehiculos/vehiculos/${id}/baja`, {
    method: 'PATCH',
    body: JSON.stringify({ motivoBaja }),
  });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo dar de baja el vehiculo'));
  return res.json() as Promise<Vehiculo>;
}

export async function cargarHistorialVehiculo(id: string) {
  const res = await apiFetch(`/vehiculos/vehiculos/${id}/historial`);
  if (!res.ok) throw new Error('No se pudo cargar el historial');
  return res.json() as Promise<EventoHistorialVehiculo[]>;
}

export async function cargarMantenimientos(vehiculoId: string) {
  const res = await apiFetch(`/vehiculos/vehiculos/${vehiculoId}/mantenimientos`);
  if (!res.ok) throw new Error('No se pudo cargar los mantenimientos');
  return res.json() as Promise<MantenimientoVehiculo[]>;
}

export async function crearMantenimiento(vehiculoId: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/vehiculos/vehiculos/${vehiculoId}/mantenimientos`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo registrar el mantenimiento'));
  return res.json() as Promise<MantenimientoVehiculo>;
}

export async function cargarCombustible(vehiculoId: string) {
  const res = await apiFetch(`/vehiculos/vehiculos/${vehiculoId}/combustible`);
  if (!res.ok) throw new Error('No se pudo cargar la carga de combustible');
  return res.json() as Promise<ConsumoCombustible[]>;
}

export async function crearCombustible(vehiculoId: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/vehiculos/vehiculos/${vehiculoId}/combustible`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo registrar la carga de combustible'));
  return res.json() as Promise<ConsumoCombustible>;
}

export async function cargarChecklistItems(tipoVehiculo?: string, soloActivos?: boolean) {
  const params = new URLSearchParams();
  if (tipoVehiculo) params.set('tipoVehiculo', tipoVehiculo);
  if (soloActivos) params.set('soloActivos', 'true');
  const res = await apiFetch(`/vehiculos/checklist-items?${params.toString()}`);
  if (!res.ok) return [] as ChecklistItemVehiculo[];
  return res.json() as Promise<ChecklistItemVehiculo[]>;
}

export async function crearChecklistItem(payload: Record<string, unknown>) {
  const res = await apiFetch('/vehiculos/checklist-items', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear el item'));
  return res.json() as Promise<ChecklistItemVehiculo>;
}

export async function actualizarChecklistItem(id: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/vehiculos/checklist-items/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar el item'));
  return res.json() as Promise<ChecklistItemVehiculo>;
}

export async function eliminarChecklistItem(id: string) {
  const res = await apiFetch(`/vehiculos/checklist-items/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo eliminar el item'));
  return res.json();
}

export interface VehiculoAutorizado {
  id: string;
  vehiculoId: string;
  numeroInterno: string | null;
  patente: string | null;
  marca: string | null;
  modelo: string | null;
  categoria: string | null;
  fechaAutorizacion: string | null;
  vigencia: string | null;
  capacitaciones: string | null;
  creadoEn: string;
}

export async function cargarVehiculosAutorizados(bomberoId: string) {
  const res = await apiFetch(`/personal/bomberos/${bomberoId}/vehiculos-autorizados`);
  if (!res.ok) return [] as VehiculoAutorizado[];
  return res.json() as Promise<VehiculoAutorizado[]>;
}
