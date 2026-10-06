import { apiFetch } from './api';
import { JSON_HEADERS, leer } from './flota';

export type EstadoAusencia = 'SOLICITADA' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA';

export interface Ausencia {
  id: string;
  bomberoId: string;
  bombero: string;
  desde: string;
  hasta: string;
  motivo: string;
  estado: EstadoAusencia;
  motivoDecision: string | null;
  solicitadaPor: string;
}

export interface AdjuntoMeta {
  id: string;
  tipo: 'FOTO' | 'FIRMA';
  descripcion: string | null;
  tomadoEn: string;
}

export const cargarAusencias = async () => leer<Ausencia[]>(await apiFetch('/ausencias'));

export const pedirAusencia = async (d: { desde: string; hasta: string; motivo: string }) =>
  leer<Ausencia>(await apiFetch('/ausencias', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(d) }));

export const decidirAusencia = async (id: string, decision: 'APROBAR' | 'RECHAZAR', motivo?: string) =>
  leer<Ausencia>(await apiFetch(`/ausencias/${id}/decision`, { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify({ decision, motivo }) }));

export const cancelarAusencia = async (id: string) =>
  leer<Ausencia>(await apiFetch(`/ausencias/${id}/cancelar`, { method: 'PATCH', headers: JSON_HEADERS, body: '{}' }));

export const cargarAdjuntos = async (entidad: string, entidadId: string) =>
  leer<AdjuntoMeta[]>(await apiFetch(`/adjuntos?entidad=${entidad}&entidadId=${entidadId}`));

/** La imagen se pide con la sesion y se muestra como URL local temporal. */
export async function urlDeAdjunto(id: string): Promise<string> {
  const res = await apiFetch(`/adjuntos/${id}/archivo`);
  if (!res.ok) throw new Error('No se pudo cargar la imagen');
  return URL.createObjectURL(await res.blob());
}
