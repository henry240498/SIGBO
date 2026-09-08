export type IconoModulo = 'building' | 'people' | 'clock' | 'shield' | 'alert' | 'truck' | 'tools' | 'academy' | 'finance' | 'box' | 'document' | 'lock' | 'chart';

/**
 * Los 15 modulos en una sola lista plana obligaban a leerla entera para encontrar uno.
 * Se agrupan por la pregunta que responde cada modulo, de lo que se usa a diario hacia
 * lo que se configura una vez.
 */
export type GrupoModulo = 'operaciones' | 'personas' | 'recursos' | 'administracion' | 'sistema';

export interface ModuloConfig {
  slug: string;
  nombre: string;
  icono: IconoModulo;
  permisoPrefijo: string;
  disponible: boolean;
  grupo: GrupoModulo;
  /** Que resuelve el modulo, en una linea. Se ve en la tarjeta de Inicio y en la barra superior. */
  descripcion: string;
}

/** Orden de aparicion en el menu: lo operativo primero, la configuracion al final. */
export const GRUPOS: Array<{ id: GrupoModulo; nombre: string }> = [
  { id: 'operaciones', nombre: 'Operaciones' },
  { id: 'personas', nombre: 'Personal y formación' },
  { id: 'recursos', nombre: 'Recursos' },
  { id: 'administracion', nombre: 'Administración' },
  { id: 'sistema', nombre: 'Sistema' },
];

export const MODULOS: ModuloConfig[] = [
  { slug: 'servicios', nombre: 'Servicios', icono: 'alert', permisoPrefijo: 'servicios:', disponible: true, grupo: 'operaciones', descripcion: 'Intervenciones atendidas: incendios, rescates y emergencias.' },
  { slug: 'denuncias', nombre: 'Denuncias', icono: 'alert', permisoPrefijo: 'denuncias:', disponible: true, grupo: 'operaciones', descripcion: 'Avisos que llegan desde la ciudadanía y su seguimiento.' },
  { slug: 'guardias', nombre: 'Guardias', icono: 'shield', permisoPrefijo: 'guardias:', disponible: true, grupo: 'operaciones', descripcion: 'Turnos, grupos, sorteos y órdenes de guardia.' },
  { slug: 'asistencia', nombre: 'Asistencia', icono: 'clock', permisoPrefijo: 'asistencia:', disponible: true, grupo: 'operaciones', descripcion: 'Marcaciones, eventos y control de presencia del personal.' },

  { slug: 'personal', nombre: 'Personal', icono: 'people', permisoPrefijo: 'personal:', disponible: true, grupo: 'personas', descripcion: 'Legajo de cada bombero: datos, ascensos, especialidades y estado.' },
  { slug: 'academia', nombre: 'Academia', icono: 'academy', permisoPrefijo: 'academia:', disponible: true, grupo: 'personas', descripcion: 'Cursos, capacitaciones, instructores y evaluaciones.' },

  { slug: 'vehiculos', nombre: 'Vehículos', icono: 'truck', permisoPrefijo: 'vehiculos:', disponible: true, grupo: 'recursos', descripcion: 'Flota, checklists e historial de mantenimiento.' },
  { slug: 'equipos', nombre: 'Equipos', icono: 'tools', permisoPrefijo: 'equipos:', disponible: true, grupo: 'recursos', descripcion: 'Equipamiento con seguimiento individual y sus categorías.' },
  { slug: 'deposito', nombre: 'Depósito', icono: 'box', permisoPrefijo: 'deposito:', disponible: true, grupo: 'recursos', descripcion: 'Inventario por cantidad: artículos, movimientos, préstamos y bajas.' },

  { slug: 'organizacion', nombre: 'Organización Institucional', icono: 'building', permisoPrefijo: 'organizacion:', disponible: true, grupo: 'administracion', descripcion: 'Estructura institucional: compañías, cuarteles, rangos y parámetros.' },
  { slug: 'finanzas', nombre: 'Finanzas', icono: 'finance', permisoPrefijo: 'finanzas:', disponible: true, grupo: 'administracion', descripcion: 'Cuotas, aportes, caja, presupuesto y facturación.' },
  { slug: 'documentos', nombre: 'Documentos', icono: 'document', permisoPrefijo: 'documentos:', disponible: true, grupo: 'administracion', descripcion: 'Expedientes, plantillas, numeración y vencimientos.' },
  { slug: 'publicaciones', nombre: 'Publicaciones', icono: 'document', permisoPrefijo: 'publicaciones:', disponible: true, grupo: 'administracion', descripcion: 'Contenido para el sitio público del cuerpo.' },

  { slug: 'seguridad', nombre: 'Seguridad', icono: 'lock', permisoPrefijo: 'seguridad:', disponible: true, grupo: 'sistema', descripcion: 'Usuarios, roles y permisos del sistema.' },
  { slug: 'inteligencia', nombre: 'Inteligencia Artificial', icono: 'chart', permisoPrefijo: 'inteligencia:', disponible: true, grupo: 'sistema', descripcion: 'Asistente de IA y propuestas de mejora del sistema.' },
];

export function moduloVisible(modulo: ModuloConfig, permisos: string[]): boolean {
  return permisos.some((p) => p.startsWith(modulo.permisoPrefijo));
}

/** Grupos con al menos un modulo visible, en el orden de GRUPOS. */
export function agruparModulos(modulos: ModuloConfig[]): Array<{ id: GrupoModulo; nombre: string; modulos: ModuloConfig[] }> {
  return GRUPOS
    .map((grupo) => ({ ...grupo, modulos: modulos.filter((m) => m.grupo === grupo.id) }))
    .filter((grupo) => grupo.modulos.length > 0);
}
