export interface ModuloConfig {
  slug: string;
  nombre: string;
  icono: string;
  permisoPrefijo: string;
  disponible: boolean;
}

export const MODULOS: ModuloConfig[] = [
  { slug: 'organizacion', nombre: 'Organizacion Institucional', icono: '🏛️', permisoPrefijo: 'organizacion:', disponible: true },
  { slug: 'personal', nombre: 'Personal', icono: '👥', permisoPrefijo: 'personal:', disponible: true },
  { slug: 'asistencia', nombre: 'Asistencia', icono: '🕒', permisoPrefijo: 'asistencia:', disponible: false },
  { slug: 'guardias', nombre: 'Guardias', icono: '🛡️', permisoPrefijo: 'guardias:', disponible: false },
  { slug: 'servicios', nombre: 'Servicios', icono: '🚨', permisoPrefijo: 'servicios:', disponible: false },
  { slug: 'vehiculos', nombre: 'Vehiculos', icono: '🚒', permisoPrefijo: 'vehiculos:', disponible: true },
  { slug: 'equipos', nombre: 'Equipos', icono: '🧯', permisoPrefijo: 'equipos:', disponible: true },
  { slug: 'academia', nombre: 'Academia', icono: '🎓', permisoPrefijo: 'academia:', disponible: false },
  { slug: 'finanzas', nombre: 'Finanzas', icono: '💰', permisoPrefijo: 'finanzas:', disponible: false },
  { slug: 'deposito', nombre: 'Deposito', icono: '📦', permisoPrefijo: 'deposito:', disponible: false },
  { slug: 'documentos', nombre: 'Documentos', icono: '📄', permisoPrefijo: 'documentos:', disponible: false },
  { slug: 'seguridad', nombre: 'Seguridad', icono: '🔐', permisoPrefijo: 'seguridad:', disponible: true },
  { slug: 'inteligencia', nombre: 'Inteligencia', icono: '📈', permisoPrefijo: 'inteligencia:', disponible: false },
];

export function moduloVisible(modulo: ModuloConfig, permisos: string[]): boolean {
  return permisos.some((p) => p.startsWith(modulo.permisoPrefijo));
}
