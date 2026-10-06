import { apiFetch } from './api';

export type EstadoOperativoMovil = 'EN_CUARTEL' | 'DESPACHADO' | 'EN_SERVICIO' | 'REGRESANDO';

export interface MovilTablero {
  id: string;
  numeroInterno: string;
  alias: string | null;
  tipo: string;
  estado: string;
  estadoOperativo: EstadoOperativoMovil;
  estadoOperativoDesde: string | null;
  alerta: 'FUERA_DEL_CUARTEL_SIN_DESPACHO' | null;
  distanciaCuartelM: number | null;
  despachoActivo: {
    id: string;
    servicioId: string;
    estado: string;
    horaSalida: string;
    numeroServicio: string | null;
    direccion: string | null;
  } | null;
}

export interface ServicioAbierto {
  id: string;
  numeroServicio: string;
  direccion: string;
  estado: string;
}

export async function leer<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let mensaje = `Error ${res.status}`;
    try {
      const cuerpo = await res.json();
      mensaje = Array.isArray(cuerpo.message) ? cuerpo.message.join(', ') : cuerpo.message || mensaje;
    } catch {
      /* cuerpo sin JSON */
    }
    throw new Error(mensaje);
  }
  return res.json() as Promise<T>;
}

export const JSON_HEADERS = { 'Content-Type': 'application/json' };

export async function cargarTablero() {
  return leer<MovilTablero[]>(await apiFetch('/flota/tablero'));
}

export async function cargarServiciosAbiertos() {
  return leer<ServicioAbierto[]>(await apiFetch('/flota/servicios-abiertos'));
}

export async function despachar(servicioId: string, vehiculoId: string) {
  return leer(
    await apiFetch('/flota/despachos', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ servicioId, vehiculoId }),
    }),
  );
}

export async function avanzarDespacho(id: string, paso: 'llegada' | 'fin' | 'regreso', kmRegreso?: number) {
  if (paso === 'llegada') return leer(await apiFetch(`/flota/despachos/${id}/llegada`, { method: 'PATCH' }));
  if (paso === 'fin') return leer(await apiFetch(`/flota/despachos/${id}/fin`, { method: 'PATCH' }));
  return leer(
    await apiFetch(`/flota/despachos/${id}/regreso`, {
      method: 'PATCH',
      headers: JSON_HEADERS,
      body: JSON.stringify(kmRegreso === undefined ? {} : { kmRegreso }),
    }),
  );
}

export async function cancelarDespacho(id: string, motivo: string) {
  return leer(
    await apiFetch(`/flota/despachos/${id}/cancelar`, {
      method: 'PATCH',
      headers: JSON_HEADERS,
      body: JSON.stringify({ motivo }),
    }),
  );
}

export async function reponerEnCuartel(vehiculoId: string, motivo: string) {
  return leer(
    await apiFetch(`/flota/moviles/${vehiculoId}/reponer-en-cuartel`, {
      method: 'PATCH',
      headers: JSON_HEADERS,
      body: JSON.stringify({ motivo }),
    }),
  );
}

export interface PosicionMovil {
  id: string;
  numeroInterno: string;
  alias: string | null;
  tipo: string;
  estadoOperativo: EstadoOperativoMovil;
  latitud: number;
  longitud: number;
  velocidadKmh: number | null;
  registradoEn: string;
}

export interface Vencimiento {
  vehiculoId: string;
  numeroInterno: string;
  tipo: string;
  fecha: string;
  vencido: boolean;
}

export async function cargarPosiciones() {
  return leer<PosicionMovil[]>(await apiFetch('/flota/posiciones'));
}

export async function cargarVencimientos(dias: number) {
  return leer<Vencimiento[]>(await apiFetch(`/flota/vencimientos?dias=${dias}`));
}

// ---- disponibilidad (2.3) ----

export interface Disponibilidad {
  generadoEn: string;
  moviles: {
    total: number;
    disponibles: Array<{ id: string; numeroInterno: string; alias: string | null; tipo: string }>;
    enServicio: Array<{ id: string; numeroInterno: string; alias: string | null; estadoOperativo: string }>;
    noOperativos: Array<{ id: string; numeroInterno: string; alias: string | null; estado: string }>;
  };
  personalDeGuardia: {
    guardiasVigentes: number;
    personal: Array<{ bomberoId: string; nombre: string; numeroBombero: string | null; rol: string | null; tipoParticipacion: string; ausente: boolean }>;
  };
  convocatorias: Array<{ id: string; mensaje: string; voy: number; noPuedo: number; menorEtaMinutos: number | null }>;
}

export const cargarDisponibilidad = async () => leer<Disponibilidad>(await apiFetch('/flota/disponibilidad'));

/** Descarga el resumen operativo en PDF de un servicio. */
export async function descargarResumenPdf(servicioId: string, nombre: string) {
  const res = await apiFetch(`/flota/informe/${servicioId}/pdf`);
  if (!res.ok) {
    await leer(res); // lanza con el mensaje del servidor
    return;
  }
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = `resumen-operativo-${nombre}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---- dotacion (1.7) y bitacora (1.6) ----

export interface ItemDotacion {
  id: string;
  descripcion: string;
  cantidadObjetivo: number;
  cantidadActual: number | null;
  faltante: number | null;
  controladoEn: string | null;
}

export interface Faltante {
  itemId: string;
  vehiculoId: string;
  numeroInterno: string;
  descripcion: string;
  objetivo: number;
  actual: number | null;
  faltante: number;
  controladoEn: string | null;
}

export interface EntradaBitacora {
  despachoId: string;
  numeroServicio: string | null;
  direccion: string | null;
  estado: string;
  horaSalida: string;
  horaRegreso: string | null;
  kmSalida: number | null;
  kmRegreso: number | null;
  kmRecorridos: number | null;
}

export const cargarDotacion = async (movilId: string) => leer<ItemDotacion[]>(await apiFetch(`/flota/moviles/${movilId}/dotacion`));
export const cargarFaltantes = async () => leer<Faltante[]>(await apiFetch('/flota/faltantes'));
export const cargarBitacora = async (movilId: string) => leer<EntradaBitacora[]>(await apiFetch(`/flota/moviles/${movilId}/bitacora`));

export const crearItemDotacion = async (movilId: string, descripcion: string, cantidadObjetivo: number) =>
  leer(await apiFetch(`/flota/moviles/${movilId}/dotacion`, { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify({ descripcion, cantidadObjetivo }) }));

export const registrarControlDotacion = async (movilId: string, lecturas: Array<{ itemId: string; cantidadActual: number }>) =>
  leer(await apiFetch(`/flota/moviles/${movilId}/dotacion/control`, { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify({ lecturas }) }));

export const darDeBajaItemDotacion = async (itemId: string) =>
  leer(await apiFetch(`/flota/dotacion/${itemId}`, { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify({ activo: false }) }));

export interface DatosPendientes {
  vehiculoId: string;
  numeroInterno: string;
  faltantes: string[];
}

export const cargarDatosPendientes = async () => leer<DatosPendientes[]>(await apiFetch('/flota/datos-pendientes'));
