export interface Modulo {
  slug: string;
  nombre: string;
  icono: string;
  disponible: boolean;
}

export const MODULOS: Modulo[] = [
  { slug: 'personal', nombre: 'Personal', icono: '👨‍🚒', disponible: true },
  { slug: 'organizacion', nombre: 'Organización', icono: '🏛️', disponible: true },
  { slug: 'seguridad', nombre: 'Seguridad', icono: '🔐', disponible: true },
  { slug: 'mi-perfil', nombre: 'Mi Perfil', icono: '👤', disponible: true },
];

export function moduloVisible(modulo: Modulo, permisos: string[]) {
  return modulo.disponible && permisos.some((p) => p.startsWith(`${modulo.slug}:`) || p === modulo.slug);
}
