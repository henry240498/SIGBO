export type IconoModulo = 'building' | 'people' | 'clock' | 'shield' | 'alert' | 'truck' | 'tools' | 'academy' | 'finance' | 'box' | 'document' | 'lock' | 'chart';

export interface ModuloConfig {
  slug: string;
  nombre: string;
  icono: IconoModulo;
  permisoPrefijo: string;
  disponible: boolean;
}

export const MODULOS: ModuloConfig[] = [
  { slug: 'organizacion', nombre: 'Organización', icono: 'building', permisoPrefijo: 'organizacion:', disponible: true },
  { slug: 'personal', nombre: 'Personal', icono: 'people', permisoPrefijo: 'personal:', disponible: true },
  { slug: 'asistencia', nombre: 'Asistencia', icono: 'clock', permisoPrefijo: 'asistencia:', disponible: false },
  { slug: 'guardias', nombre: 'Guardias', icono: 'shield', permisoPrefijo: 'guardias:', disponible: false },
  { slug: 'servicios', nombre: 'Servicios', icono: 'alert', permisoPrefijo: 'servicios:', disponible: true },
  { slug: 'vehiculos', nombre: 'Vehículos', icono: 'truck', permisoPrefijo: 'vehiculos:', disponible: true },
  { slug: 'equipos', nombre: 'Equipos', icono: 'tools', permisoPrefijo: 'equipos:', disponible: true },
  { slug: 'academia', nombre: 'Academia', icono: 'academy', permisoPrefijo: 'academia:', disponible: false },
  { slug: 'finanzas', nombre: 'Finanzas', icono: 'finance', permisoPrefijo: 'finanzas:', disponible: false },
  { slug: 'deposito', nombre: 'Depósito', icono: 'box', permisoPrefijo: 'deposito:', disponible: false },
  { slug: 'documentos', nombre: 'Documentos', icono: 'document', permisoPrefijo: 'documentos:', disponible: false },
  { slug: 'publicaciones', nombre: 'Publicaciones', icono: 'document', permisoPrefijo: '', disponible: true },
  { slug: 'seguridad', nombre: 'Seguridad', icono: 'lock', permisoPrefijo: 'seguridad:', disponible: true },
  { slug: 'inteligencia', nombre: 'Inteligencia', icono: 'chart', permisoPrefijo: 'inteligencia:', disponible: false },
];

export function moduloVisible(modulo: ModuloConfig, permisos: string[]): boolean {
  return permisos.some((p) => p.startsWith(modulo.permisoPrefijo));
}
