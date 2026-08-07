/**
 * Catalogo de permisos y roles predeterminados de SIGBO-CBVC.
 * Fuente: Proyecto.txt, seccion 4.2, mas el rol DEPOSITO agregado para
 * cubrir el perfil "Encargado de Deposito" descrito en la seccion 1.3
 * (el documento lo menciona como publico objetivo pero no lo formaliza
 * como rol predeterminado).
 */

export interface PermisoSeed {
  nombre: string;
  recurso: string;
  accion: string;
  categoria: string;
}

export const PERMISOS: PermisoSeed[] = [
  // PERSONAL
  { nombre: 'personal:ver', recurso: 'personal', accion: 'ver', categoria: 'Personal' },
  { nombre: 'personal:crear', recurso: 'personal', accion: 'crear', categoria: 'Personal' },
  { nombre: 'personal:editar', recurso: 'personal', accion: 'editar', categoria: 'Personal' },
  { nombre: 'personal:eliminar', recurso: 'personal', accion: 'eliminar', categoria: 'Personal' },
  { nombre: 'personal:editar_estado', recurso: 'personal', accion: 'editar_estado', categoria: 'Personal' },
  { nombre: 'personal:editar_rango', recurso: 'personal', accion: 'editar_rango', categoria: 'Personal' },
  { nombre: 'personal:ver_medico', recurso: 'personal', accion: 'ver_medico', categoria: 'Personal' },
  { nombre: 'personal:editar_medico', recurso: 'personal', accion: 'editar_medico', categoria: 'Personal' },
  { nombre: 'personal:ver_disciplinario', recurso: 'personal', accion: 'ver_disciplinario', categoria: 'Personal' },
  { nombre: 'personal:editar_disciplinario', recurso: 'personal', accion: 'editar_disciplinario', categoria: 'Personal' },
  // ASISTENCIA
  { nombre: 'asistencia:ver', recurso: 'asistencia', accion: 'ver', categoria: 'Asistencia' },
  { nombre: 'asistencia:marcar', recurso: 'asistencia', accion: 'marcar', categoria: 'Asistencia' },
  { nombre: 'asistencia:editar', recurso: 'asistencia', accion: 'editar', categoria: 'Asistencia' },
  { nombre: 'asistencia:ver_porcentaje', recurso: 'asistencia', accion: 'ver_porcentaje', categoria: 'Asistencia' },
  { nombre: 'asistencia:generar_alertas', recurso: 'asistencia', accion: 'generar_alertas', categoria: 'Asistencia' },
  // GUARDIAS
  { nombre: 'guardias:ver', recurso: 'guardias', accion: 'ver', categoria: 'Guardias' },
  { nombre: 'guardias:crear', recurso: 'guardias', accion: 'crear', categoria: 'Guardias' },
  { nombre: 'guardias:editar', recurso: 'guardias', accion: 'editar', categoria: 'Guardias' },
  { nombre: 'guardias:eliminar', recurso: 'guardias', accion: 'eliminar', categoria: 'Guardias' },
  { nombre: 'guardias:asignar', recurso: 'guardias', accion: 'asignar', categoria: 'Guardias' },
  { nombre: 'guardias:cambiar', recurso: 'guardias', accion: 'cambiar', categoria: 'Guardias' },
  { nombre: 'guardias:reemplazar', recurso: 'guardias', accion: 'reemplazar', categoria: 'Guardias' },
  { nombre: 'guardias:calendario', recurso: 'guardias', accion: 'calendario', categoria: 'Guardias' },
  // SERVICIOS
  { nombre: 'servicios:ver', recurso: 'servicios', accion: 'ver', categoria: 'Servicios' },
  { nombre: 'servicios:crear', recurso: 'servicios', accion: 'crear', categoria: 'Servicios' },
  { nombre: 'servicios:editar', recurso: 'servicios', accion: 'editar', categoria: 'Servicios' },
  { nombre: 'servicios:eliminar', recurso: 'servicios', accion: 'eliminar', categoria: 'Servicios' },
  { nombre: 'servicios:despachar', recurso: 'servicios', accion: 'despachar', categoria: 'Servicios' },
  { nombre: 'servicios:finalizar', recurso: 'servicios', accion: 'finalizar', categoria: 'Servicios' },
  { nombre: 'servicios:ver_gps', recurso: 'servicios', accion: 'ver_gps', categoria: 'Servicios' },
  { nombre: 'servicios:exportar_informe', recurso: 'servicios', accion: 'exportar_informe', categoria: 'Servicios' },
  // VEHICULOS
  { nombre: 'vehiculos:ver', recurso: 'vehiculos', accion: 'ver', categoria: 'Vehiculos' },
  { nombre: 'vehiculos:crear', recurso: 'vehiculos', accion: 'crear', categoria: 'Vehiculos' },
  { nombre: 'vehiculos:editar', recurso: 'vehiculos', accion: 'editar', categoria: 'Vehiculos' },
  { nombre: 'vehiculos:eliminar', recurso: 'vehiculos', accion: 'eliminar', categoria: 'Vehiculos' },
  { nombre: 'vehiculos:mantenimiento', recurso: 'vehiculos', accion: 'mantenimiento', categoria: 'Vehiculos' },
  { nombre: 'vehiculos:combustible', recurso: 'vehiculos', accion: 'combustible', categoria: 'Vehiculos' },
  // EQUIPOS
  { nombre: 'equipos:ver', recurso: 'equipos', accion: 'ver', categoria: 'Equipos' },
  { nombre: 'equipos:crear', recurso: 'equipos', accion: 'crear', categoria: 'Equipos' },
  { nombre: 'equipos:editar', recurso: 'equipos', accion: 'editar', categoria: 'Equipos' },
  { nombre: 'equipos:eliminar', recurso: 'equipos', accion: 'eliminar', categoria: 'Equipos' },
  { nombre: 'equipos:prestar', recurso: 'equipos', accion: 'prestar', categoria: 'Equipos' },
  { nombre: 'equipos:mantenimiento', recurso: 'equipos', accion: 'mantenimiento', categoria: 'Equipos' },
  // ACADEMIA
  { nombre: 'academia:ver', recurso: 'academia', accion: 'ver', categoria: 'Academia' },
  { nombre: 'academia:crear_curso', recurso: 'academia', accion: 'crear_curso', categoria: 'Academia' },
  { nombre: 'academia:editar_curso', recurso: 'academia', accion: 'editar_curso', categoria: 'Academia' },
  { nombre: 'academia:inscribir', recurso: 'academia', accion: 'inscribir', categoria: 'Academia' },
  { nombre: 'academia:calificar', recurso: 'academia', accion: 'calificar', categoria: 'Academia' },
  { nombre: 'academia:certificar', recurso: 'academia', accion: 'certificar', categoria: 'Academia' },
  // FINANZAS
  { nombre: 'finanzas:ver', recurso: 'finanzas', accion: 'ver', categoria: 'Finanzas' },
  { nombre: 'finanzas:crear', recurso: 'finanzas', accion: 'crear', categoria: 'Finanzas' },
  { nombre: 'finanzas:editar', recurso: 'finanzas', accion: 'editar', categoria: 'Finanzas' },
  { nombre: 'finanzas:eliminar', recurso: 'finanzas', accion: 'eliminar', categoria: 'Finanzas' },
  { nombre: 'finanzas:balance', recurso: 'finanzas', accion: 'balance', categoria: 'Finanzas' },
  // DEPOSITO
  { nombre: 'deposito:ver', recurso: 'deposito', accion: 'ver', categoria: 'Deposito' },
  { nombre: 'deposito:crear', recurso: 'deposito', accion: 'crear', categoria: 'Deposito' },
  { nombre: 'deposito:editar', recurso: 'deposito', accion: 'editar', categoria: 'Deposito' },
  { nombre: 'deposito:movimiento', recurso: 'deposito', accion: 'movimiento', categoria: 'Deposito' },
  // DOCUMENTOS
  { nombre: 'documentos:ver', recurso: 'documentos', accion: 'ver', categoria: 'Documentos' },
  { nombre: 'documentos:crear', recurso: 'documentos', accion: 'crear', categoria: 'Documentos' },
  { nombre: 'documentos:editar', recurso: 'documentos', accion: 'editar', categoria: 'Documentos' },
  { nombre: 'documentos:eliminar', recurso: 'documentos', accion: 'eliminar', categoria: 'Documentos' },
  { nombre: 'documentos:firmar', recurso: 'documentos', accion: 'firmar', categoria: 'Documentos' },
  // SEGURIDAD (ADMIN)
  { nombre: 'seguridad:ver_usuarios', recurso: 'seguridad', accion: 'ver_usuarios', categoria: 'Seguridad' },
  { nombre: 'seguridad:crear_usuario', recurso: 'seguridad', accion: 'crear_usuario', categoria: 'Seguridad' },
  { nombre: 'seguridad:editar_usuario', recurso: 'seguridad', accion: 'editar_usuario', categoria: 'Seguridad' },
  { nombre: 'seguridad:eliminar_usuario', recurso: 'seguridad', accion: 'eliminar_usuario', categoria: 'Seguridad' },
  { nombre: 'seguridad:crear_rol', recurso: 'seguridad', accion: 'crear_rol', categoria: 'Seguridad' },
  { nombre: 'seguridad:editar_rol', recurso: 'seguridad', accion: 'editar_rol', categoria: 'Seguridad' },
  { nombre: 'seguridad:eliminar_rol', recurso: 'seguridad', accion: 'eliminar_rol', categoria: 'Seguridad' },
  { nombre: 'seguridad:crear_permiso', recurso: 'seguridad', accion: 'crear_permiso', categoria: 'Seguridad' },
  { nombre: 'seguridad:editar_permiso', recurso: 'seguridad', accion: 'editar_permiso', categoria: 'Seguridad' },
  { nombre: 'seguridad:eliminar_permiso', recurso: 'seguridad', accion: 'eliminar_permiso', categoria: 'Seguridad' },
  { nombre: 'seguridad:ver_logs', recurso: 'seguridad', accion: 'ver_logs', categoria: 'Seguridad' },
  { nombre: 'seguridad:cerrar_sesion', recurso: 'seguridad', accion: 'cerrar_sesion', categoria: 'Seguridad' },
  // INTELIGENCIA
  { nombre: 'inteligencia:ver_alertas', recurso: 'inteligencia', accion: 'ver_alertas', categoria: 'Inteligencia' },
  { nombre: 'inteligencia:configurar', recurso: 'inteligencia', accion: 'configurar', categoria: 'Inteligencia' },
  { nombre: 'inteligencia:ver_dashboard', recurso: 'inteligencia', accion: 'ver_dashboard', categoria: 'Inteligencia' },
  { nombre: 'inteligencia:exportar_reportes', recurso: 'inteligencia', accion: 'exportar_reportes', categoria: 'Inteligencia' },
];

export interface RolSeed {
  slug: string;
  username: string;
  password: string;
  nombre: string;
  descripcion: string;
  color: string;
  prioridad: number;
  esAdministrativo: boolean;
  permisos: string[] | 'all';
}

export const ROLES: RolSeed[] = [
  {
    slug: 'ADMIN',
    username: 'admin',
    password: 'Admin#2026!',
    nombre: 'Administrador General',
    descripcion: 'Acceso completo a todas las funcionalidades del sistema',
    color: '#DC2626',
    prioridad: 100,
    esAdministrativo: true,
    permisos: 'all',
  },
  {
    slug: 'COMANDANTE',
    username: 'comandante',
    password: 'Comandante#2026!',
    nombre: 'Comandante',
    descripcion: 'Acceso a todas las operaciones y gestion de personal',
    color: '#2563EB',
    prioridad: 90,
    esAdministrativo: false,
    permisos: [
      'personal:ver', 'personal:editar_estado', 'personal:editar_rango',
      'servicios:ver', 'servicios:despachar', 'servicios:finalizar',
      'guardias:ver', 'guardias:asignar', 'guardias:cambiar',
      'asistencia:ver', 'asistencia:ver_porcentaje', 'asistencia:generar_alertas',
      'vehiculos:ver', 'equipos:ver',
      'documentos:ver', 'documentos:crear', 'documentos:firmar',
      'inteligencia:ver_alertas', 'inteligencia:ver_dashboard',
      'finanzas:ver', 'academia:ver',
    ],
  },
  {
    slug: 'JEFE_GUARDIA',
    username: 'jefe_guardia',
    password: 'JefeGuardia#2026!',
    nombre: 'Jefe de Guardia',
    descripcion: 'Gestion de la guardia actual y servicios en curso',
    color: '#16A34A',
    prioridad: 80,
    esAdministrativo: false,
    permisos: [
      'personal:ver',
      'servicios:ver', 'servicios:crear', 'servicios:editar', 'servicios:despachar', 'servicios:finalizar',
      'guardias:ver', 'guardias:calendario',
      'asistencia:marcar',
      'vehiculos:ver', 'equipos:ver',
    ],
  },
  {
    slug: 'INSTRUCTOR',
    username: 'instructor',
    password: 'Instructor#2026!',
    nombre: 'Instructor',
    descripcion: 'Gestion de cursos y academia',
    color: '#D97706',
    prioridad: 70,
    esAdministrativo: false,
    permisos: [
      'personal:ver',
      'academia:ver', 'academia:crear_curso', 'academia:editar_curso',
      'academia:inscribir', 'academia:calificar', 'academia:certificar',
      'asistencia:ver', 'asistencia:marcar',
      'documentos:ver',
    ],
  },
  {
    slug: 'BOMBERO',
    username: 'bombero',
    password: 'Bombero#2026!',
    nombre: 'Bombero Operativo',
    descripcion: 'Funcionalidades basicas para bomberos activos',
    color: '#6B7280',
    prioridad: 50,
    esAdministrativo: false,
    permisos: [
      'personal:ver',
      'asistencia:ver', 'asistencia:marcar', 'asistencia:ver_porcentaje',
      'guardias:ver',
      'servicios:ver',
      'documentos:ver',
    ],
  },
  {
    slug: 'TESORERO',
    username: 'tesorero',
    password: 'Tesorero#2026!',
    nombre: 'Tesorero',
    descripcion: 'Gestion financiera completa',
    color: '#7C3AED',
    prioridad: 80,
    esAdministrativo: true,
    permisos: [
      'finanzas:ver', 'finanzas:crear', 'finanzas:editar', 'finanzas:eliminar', 'finanzas:balance',
      'deposito:ver', 'deposito:movimiento',
      'documentos:ver', 'documentos:crear',
    ],
  },
  {
    slug: 'DEPOSITO',
    username: 'deposito',
    password: 'Deposito#2026!',
    nombre: 'Encargado de Deposito',
    descripcion: 'Control de inventario, stock de consumibles y prestamos de equipos',
    color: '#0891B2',
    prioridad: 60,
    esAdministrativo: false,
    permisos: [
      'deposito:ver', 'deposito:crear', 'deposito:editar', 'deposito:movimiento',
      'equipos:ver', 'equipos:prestar', 'equipos:mantenimiento',
      'documentos:ver',
    ],
  },
];
