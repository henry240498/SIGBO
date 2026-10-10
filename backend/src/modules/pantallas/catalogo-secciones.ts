/**
 * Secciones del Centro de mando (spec 2026-10-09 §5.4). Cada una es una "pantalla" de la
 * matriz: se puede restringir por usuario, rol, rango o cargo como cualquier otra.
 * base: los permisos por rol que hacen falta (alguno), o SIEMPRE.
 */
export type ClaveSeccion =
  | 'accesos' | 'emergencias' | 'alertas' | 'moviles' | 'personal'
  | 'guardia' | 'convocatorias' | 'mi_actividad' | 'pendientes' | 'sistema';

export interface SeccionCentroMando {
  clave: ClaveSeccion;
  codigo: string;
  nombre: string;
  descripcion: string;
  base: 'SIEMPRE' | string[];
}

export const SECCIONES_CENTRO_MANDO: SeccionCentroMando[] = [
  { clave: 'accesos', codigo: '0xC002', nombre: 'Accesos rápidos', descripcion: 'Módulos y pantallas que la persona puede abrir, con buscador.', base: 'SIEMPRE' },
  { clave: 'emergencias', codigo: '0xC003', nombre: 'Emergencias en curso', descripcion: 'Solo las que la persona integra, salvo permiso de supervisión.', base: ['servicios:ver', 'despacho:responder', 'despacho:servicio'] },
  { clave: 'alertas', codigo: '0xC004', nombre: 'Alertas activas', descripcion: 'Alertas de emergencia pendientes de atención.', base: ['servicios:ver'] },
  { clave: 'moviles', codigo: '0xC005', nombre: 'Móviles', descripcion: 'Móviles disponibles, en servicio y fuera de servicio.', base: ['vehiculos:ver', 'servicios:ver'] },
  { clave: 'personal', codigo: '0xC006', nombre: 'Personal disponible', descripcion: 'Bomberos por disponibilidad: al llamado, en base, en camino, en servicio.', base: ['servicios:ver', 'despacho:seguimiento'] },
  { clave: 'guardia', codigo: '0xC007', nombre: 'Guardia de turno', descripcion: 'Guardias vigentes ahora y su personal.', base: ['guardias:ver', 'servicios:ver'] },
  { clave: 'convocatorias', codigo: '0xC008', nombre: 'Convocatorias abiertas', descripcion: 'Convocatorias abiertas y sus respuestas.', base: ['servicios:ver'] },
  { clave: 'mi_actividad', codigo: '0xC009', nombre: 'Mi actividad', descripcion: 'Próximas guardias y últimos servicios propios.', base: 'SIEMPRE' },
  { clave: 'pendientes', codigo: '0xC00A', nombre: 'Pendientes de mi función', descripcion: 'Lo que espera una decisión de la persona; cada ítem exige su permiso.', base: 'SIEMPRE' },
  { clave: 'sistema', codigo: '0xC00B', nombre: 'Estado del sistema', descripcion: 'Semáforo de servicios, respaldos y tareas.', base: ['sistema:ver'] },
];
