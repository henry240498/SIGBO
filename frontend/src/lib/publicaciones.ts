import { apiFetch } from './api';

export type CategoriaPublicacion = 'Noticia' | 'Suceso' | 'Evento' | 'Logro';

export interface PublicacionPublica {
  id: string;
  titulo: string;
  resumen: string;
  contenido: string;
  fecha: string;
  categoria: CategoriaPublicacion;
  imagen: string;
  visible: boolean;
  destacada: boolean;
  orden: number;
  color: string;
}

export const PUBLICACIONES_INICIALES: PublicacionPublica[] = [];

export async function cargarPublicaciones(todas = false): Promise<PublicacionPublica[]> {
  const response = await apiFetch(todas ? '/publicaciones' : '/publicaciones/publicas', { cache: 'no-store' });
  if (!response.ok) throw new Error('No se pudieron cargar las publicaciones');
  return response.json();
}

export async function guardarPublicaciones(items: PublicacionPublica[]): Promise<PublicacionPublica[]> {
  const response = await apiFetch('/publicaciones', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(items) });
  if (!response.ok) throw new Error('No se pudieron guardar las publicaciones');
  return response.json();
}
