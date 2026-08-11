import { apiFetch } from './api';

export interface Parametro {
  id: string;
  tipo: string;
  padreId: string | null;
  nombre: string;
  codigo: string | null;
  descripcion: string | null;
  orden: number;
  estado: 'ACTIVO' | 'INACTIVO';
  eliminadoEn: string | null;
}

export type TipoParametro =
  | 'PAIS'
  | 'DEPARTAMENTO'
  | 'CIUDAD'
  | 'BARRIO'
  | 'PROFESION'
  | 'IDIOMA'
  | 'NIVEL_IDIOMA'
  | 'GRUPO_SANGUINEO'
  | 'FACTOR_RH'
  | 'TIPO_SEGURO'
  | 'ASEGURADORA'
  | 'TIPO_EVENTO_ASISTENCIA'
  | 'UBICACION_EQUIPO'
  | 'ESTADO_PRESENCIA_GUARDIA'
  | 'SECTOR_ESTACION';

/** Carga parametros activos de un tipo, opcionalmente filtrados por padre
 * (jerarquia geografica). Usado por todos los combos parametricos de Personal. */
export async function cargarParametros(tipo: TipoParametro, padreId?: string | null): Promise<Parametro[]> {
  const params = new URLSearchParams({ tipo, estado: 'ACTIVO' });
  if (padreId) params.set('padreId', padreId);
  const res = await apiFetch(`/organizacion/parametros?${params.toString()}`);
  if (!res.ok) return [];
  return res.json();
}

/** Resuelve un unico parametro por id (para mostrar su nombre en vistas de
 * solo lectura sin tener que reconstruir toda la cadena jerarquica). */
export async function obtenerParametro(id: string): Promise<Parametro | null> {
  const res = await apiFetch(`/organizacion/parametros/${id}`);
  if (!res.ok) return null;
  return res.json();
}

/** Resuelve varios parametros por id en paralelo, devolviendo un mapa id->nombre. */
export async function resolverNombres(ids: Array<string | null | undefined>): Promise<Map<string, string>> {
  const idsUnicos = [...new Set(ids.filter((id): id is string => !!id))];
  const resultados = await Promise.all(idsUnicos.map((id) => obtenerParametro(id)));
  const mapa = new Map<string, string>();
  resultados.forEach((p, i) => {
    if (p) mapa.set(idsUnicos[i], p.nombre);
  });
  return mapa;
}
