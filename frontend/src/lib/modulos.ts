export type IconoModulo = 'building' | 'people' | 'clock' | 'shield' | 'alert' | 'truck' | 'tools' | 'academy' | 'finance' | 'box' | 'document' | 'lock' | 'chart';

export interface ModuloConfig {
  slug: string;
  nombre: string;
  icono: IconoModulo;
  permisoPrefijo: string;
  disponible: boolean;
}

export const MODULOS: ModuloConfig[] = [
  { slug: 'organizacion', nombre: 'Organización Institucional', icono: 'building', permisoPrefijo: 'organizacion:', disponible: true },
  { slug: 'personal', nombre: 'Personal', icono: 'people', permisoPrefijo: 'personal:', disponible: true },
  { slug: 'asistencia', nombre: 'Asistencia', icono: 'clock', permisoPrefijo: 'asistencia:', disponible: true },
  { slug: 'guardias', nombre: 'Guardias', icono: 'shield', permisoPrefijo: 'guardias:', disponible: true },
  { slug: 'servicios', nombre: 'Servicios', icono: 'alert', permisoPrefijo: 'servicios:', disponible: true },
  { slug: 'vehiculos', nombre: 'Vehículos', icono: 'truck', permisoPrefijo: 'vehiculos:', disponible: true },
  { slug: 'equipos', nombre: 'Equipos', icono: 'tools', permisoPrefijo: 'equipos:', disponible: true },
  { slug: 'academia', nombre: 'Academia', icono: 'academy', permisoPrefijo: 'academia:', disponible: true },
  { slug: 'finanzas', nombre: 'Finanzas', icono: 'finance', permisoPrefijo: 'finanzas:', disponible: true },
  { slug: 'deposito', nombre: 'Depósito', icono: 'box', permisoPrefijo: 'deposito:', disponible: true },
  { slug: 'documentos', nombre: 'Documentos', icono: 'document', permisoPrefijo: 'documentos:', disponible: true },
  { slug: 'publicaciones', nombre: 'Publicaciones', icono: 'document', permisoPrefijo: 'publicaciones:', disponible: true },
  { slug: 'denuncias', nombre: 'Denuncias', icono: 'alert', permisoPrefijo: 'denuncias:', disponible: true },
  { slug: 'seguridad', nombre: 'Seguridad', icono: 'lock', permisoPrefijo: 'seguridad:', disponible: true },
  { slug: 'inteligencia', nombre: 'Inteligencia Artificial', icono: 'chart', permisoPrefijo: 'inteligencia:', disponible: true },
];

export function moduloVisible(modulo: ModuloConfig, permisos: string[]): boolean {
  return permisos.some((p) => p.startsWith(modulo.permisoPrefijo));
}
