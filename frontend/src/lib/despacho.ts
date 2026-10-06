import { apiFetch } from './api';

async function leer<T>(ruta: string, init?: RequestInit): Promise<T> {
  const r = await apiFetch(ruta, init);
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error(j?.message ?? 'No se pudo consultar despacho.');
  return j as T;
}

export interface DestinatarioDespacho {
  usuarioId: string;
  usuarioNombre: string;
  entrega: 'ENVIADA' | 'SIN_CONEXION' | 'NO_DISPONIBLE' | 'FUERA_DE_HORARIO' | 'EN_SERVICIO' | 'NO_HABILITADO_CHOFER';
  estado: 'PENDIENTE' | 'ACEPTO' | 'NO_PUEDE' | 'CANCELO' | 'EN_CAMINO' | 'LLEGO';
  recibidaEn: string | null;
  vistoTardeEn: string | null;
  aceptadaEn: string | null;
  enCaminoEn: string | null;
  llegoEn: string | null;
  canceladaEn: string | null;
  motivo: string | null;
  ampliacion: boolean;
}

export interface SolicitudDespacho {
  id: string;
  tipo: 'CHOFER' | 'PERSONAL' | 'RAPIDA';
  estado: 'ABIERTA' | 'CERRADA' | 'CANCELADA';
  texto: string;
  moviles: string[];
  creadaPor: string;
  creadoEn: string;
  cerradaEn: string | null;
  servicioId: string | null;
  totales: Record<string, number>;
  grupos: {
    aceptaron: DestinatarioDespacho[];
    enCamino: DestinatarioDespacho[];
    llegaron: DestinatarioDespacho[];
    noPueden: DestinatarioDespacho[];
    cancelaron: DestinatarioDespacho[];
    sinResponder: DestinatarioDespacho[];
    enviadasSinConfirmar: DestinatarioDespacho[];
    noRecibieron: {
      sinConexion: DestinatarioDespacho[];
      noDisponible: DestinatarioDespacho[];
      fueraDeHorario: DestinatarioDespacho[];
      enServicio: DestinatarioDespacho[];
      noHabilitadoChofer: DestinatarioDespacho[];
    };
  };
}

export interface EventoDespacho {
  id: string;
  tipo: string;
  actor: string | null;
  detalle: Record<string, unknown> | null;
  ocurridoEn: string;
  registradoEn: string;
}

export interface MovilDespacho {
  id: string;
  numeroInterno: string;
  alias: string | null;
  tipo: string;
}

export interface MapaServicioOperativo {
  mapaBase: { urlTeselas: string | null; atribucion: string };
  servicio: {
    id: string;
    numeroServicio: string | null;
    estado: string;
    ubicacionRestringida: boolean;
    ubicacion: { latitud: number; longitud: number; direccion: string | null } | null;
  };
  moviles: Array<{
    movil: string;
    estado: string;
    posicion: { latitud: number; longitud: number; registradoEn: string } | null;
  }>;
  personal: Array<{
    nombre: string;
    estado: string;
    desde: string;
    llegadaEn: string | null;
    hasta: string | null;
  }>;
  resumen: { enCamino: number; enSitio: number; retirados: number };
}

export const listarSolicitudesDespacho = () => leer<SolicitudDespacho[]>('/despacho/solicitudes?abiertas=false');
export const detalleSolicitudDespacho = (id: string) => leer<SolicitudDespacho>(`/despacho/solicitudes/${id}`);
export const lineaSolicitudDespacho = (id: string) => leer<EventoDespacho[]>(`/despacho/solicitudes/${id}/linea`);
export const mapaServicioOperativo = (id: string) => leer<MapaServicioOperativo>(`/despacho/servicios/${id}/mapa`);
export const movilesDisponiblesDespacho = async () => {
  const r = await leer<{ moviles: { disponibles: MovilDespacho[] } }>('/flota/disponibilidad');
  return r.moviles.disponibles;
};
export const crearSolicitudDespacho = (tipo: 'CHOFER' | 'PERSONAL' | 'RAPIDA', moviles: string[]) =>
  leer<SolicitudDespacho>('/despacho/solicitudes', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo, ...(moviles.length ? { moviles } : {}) }),
  });
export const ampliarSolicitudDespacho = (id: string) => leer(`/despacho/solicitudes/${id}/ampliar`, { method: 'POST' });
export const cerrarSolicitudDespacho = (id: string, estado: 'CERRADA' | 'CANCELADA') =>
  leer(`/despacho/solicitudes/${id}/cerrar`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado }),
  });
