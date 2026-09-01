// GENERADO por scripts/generar-pantallas.mjs — no editar a mano.
// Volver a generar con: npm run generar:pantallas

export interface PantallaRegistrada {
  /** Ruta absoluta, tal cual la espera next/link. */
  ruta: string;
  /** Nombre legible: el del submenu si existe, si no derivado del slug. */
  nombre: string;
  /** Slug del modulo al que pertenece, para filtrar por permisos. */
  modulo: string;
}

export const PANTALLAS: PantallaRegistrada[] = [
  {
    "ruta": "/dashboard",
    "nombre": "Inicio",
    "modulo": "inicio"
  },
  {
    "ruta": "/dashboard/academia",
    "nombre": "Actividades",
    "modulo": "academia"
  },
  {
    "ruta": "/dashboard/academia/cursos-externos",
    "nombre": "Cursos externos (OBA)",
    "modulo": "academia"
  },
  {
    "ruta": "/dashboard/academia/instructores-externos",
    "nombre": "Instructores externos",
    "modulo": "academia"
  },
  {
    "ruta": "/dashboard/asistencia",
    "nombre": "Resumen",
    "modulo": "asistencia"
  },
  {
    "ruta": "/dashboard/asistencia/auditoria",
    "nombre": "Auditoría",
    "modulo": "asistencia"
  },
  {
    "ruta": "/dashboard/asistencia/eventos",
    "nombre": "Eventos",
    "modulo": "asistencia"
  },
  {
    "ruta": "/dashboard/asistencia/externos",
    "nombre": "Personas externas",
    "modulo": "asistencia"
  },
  {
    "ruta": "/dashboard/asistencia/registro",
    "nombre": "Registro",
    "modulo": "asistencia"
  },
  {
    "ruta": "/dashboard/asistencia/tolerancias",
    "nombre": "Tolerancias",
    "modulo": "asistencia"
  },
  {
    "ruta": "/dashboard/denuncias",
    "nombre": "Denuncias",
    "modulo": "denuncias"
  },
  {
    "ruta": "/dashboard/deposito",
    "nombre": "Resumen",
    "modulo": "deposito"
  },
  {
    "ruta": "/dashboard/deposito/articulos",
    "nombre": "Artículos",
    "modulo": "deposito"
  },
  {
    "ruta": "/dashboard/deposito/bajas",
    "nombre": "Bajas",
    "modulo": "deposito"
  },
  {
    "ruta": "/dashboard/deposito/categorias",
    "nombre": "Categorías",
    "modulo": "deposito"
  },
  {
    "ruta": "/dashboard/deposito/entradas",
    "nombre": "Entradas",
    "modulo": "deposito"
  },
  {
    "ruta": "/dashboard/deposito/incidencias",
    "nombre": "Incidencias",
    "modulo": "deposito"
  },
  {
    "ruta": "/dashboard/deposito/inventarios-fisicos",
    "nombre": "Inventarios físicos",
    "modulo": "deposito"
  },
  {
    "ruta": "/dashboard/deposito/mantenimientos",
    "nombre": "Mantenimientos",
    "modulo": "deposito"
  },
  {
    "ruta": "/dashboard/deposito/movimientos",
    "nombre": "Movimientos",
    "modulo": "deposito"
  },
  {
    "ruta": "/dashboard/deposito/prestamos",
    "nombre": "Préstamos",
    "modulo": "deposito"
  },
  {
    "ruta": "/dashboard/deposito/proveedores",
    "nombre": "Proveedores",
    "modulo": "deposito"
  },
  {
    "ruta": "/dashboard/deposito/ubicaciones",
    "nombre": "Ubicaciones",
    "modulo": "deposito"
  },
  {
    "ruta": "/dashboard/documentos",
    "nombre": "Resumen",
    "modulo": "documentos"
  },
  {
    "ruta": "/dashboard/documentos/auditoria",
    "nombre": "Auditoría",
    "modulo": "documentos"
  },
  {
    "ruta": "/dashboard/documentos/expedientes",
    "nombre": "Expedientes",
    "modulo": "documentos"
  },
  {
    "ruta": "/dashboard/documentos/listado",
    "nombre": "Documentos",
    "modulo": "documentos"
  },
  {
    "ruta": "/dashboard/documentos/plantillas",
    "nombre": "Plantillas",
    "modulo": "documentos"
  },
  {
    "ruta": "/dashboard/documentos/vencimientos",
    "nombre": "Vencimientos",
    "modulo": "documentos"
  },
  {
    "ruta": "/dashboard/equipos",
    "nombre": "Equipos",
    "modulo": "equipos"
  },
  {
    "ruta": "/dashboard/equipos/categorias",
    "nombre": "Categorías",
    "modulo": "equipos"
  },
  {
    "ruta": "/dashboard/finanzas",
    "nombre": "Resumen",
    "modulo": "finanzas"
  },
  {
    "ruta": "/dashboard/finanzas/beneficios",
    "nombre": "Beneficios",
    "modulo": "finanzas"
  },
  {
    "ruta": "/dashboard/finanzas/cajas",
    "nombre": "Cajas",
    "modulo": "finanzas"
  },
  {
    "ruta": "/dashboard/finanzas/cuentas-bancarias",
    "nombre": "Cuentas bancarias",
    "modulo": "finanzas"
  },
  {
    "ruta": "/dashboard/finanzas/cuotas",
    "nombre": "Cuotas",
    "modulo": "finanzas"
  },
  {
    "ruta": "/dashboard/finanzas/ejercicios-fiscales",
    "nombre": "Ejercicios fiscales",
    "modulo": "finanzas"
  },
  {
    "ruta": "/dashboard/finanzas/facturacion",
    "nombre": "Facturación",
    "modulo": "finanzas"
  },
  {
    "ruta": "/dashboard/finanzas/movimientos",
    "nombre": "Movimientos",
    "modulo": "finanzas"
  },
  {
    "ruta": "/dashboard/finanzas/movimientos-bancarios",
    "nombre": "Conciliación",
    "modulo": "finanzas"
  },
  {
    "ruta": "/dashboard/finanzas/ordenes-pago",
    "nombre": "Órdenes de pago",
    "modulo": "finanzas"
  },
  {
    "ruta": "/dashboard/finanzas/presupuesto",
    "nombre": "Presupuesto",
    "modulo": "finanzas"
  },
  {
    "ruta": "/dashboard/finanzas/socios-protectores",
    "nombre": "Socios protectores",
    "modulo": "finanzas"
  },
  {
    "ruta": "/dashboard/guardias",
    "nombre": "Guardias",
    "modulo": "guardias"
  },
  {
    "ruta": "/dashboard/guardias/auditoria",
    "nombre": "Auditoría",
    "modulo": "guardias"
  },
  {
    "ruta": "/dashboard/guardias/esquemas-horario",
    "nombre": "Esquemas de horario",
    "modulo": "guardias"
  },
  {
    "ruta": "/dashboard/guardias/generar",
    "nombre": "Generar",
    "modulo": "guardias"
  },
  {
    "ruta": "/dashboard/guardias/grupos",
    "nombre": "Grupos",
    "modulo": "guardias"
  },
  {
    "ruta": "/dashboard/guardias/ordenes",
    "nombre": "Órdenes de guardia",
    "modulo": "guardias"
  },
  {
    "ruta": "/dashboard/guardias/ordenes/configuracion",
    "nombre": "Configuración de órdenes",
    "modulo": "guardias"
  },
  {
    "ruta": "/dashboard/guardias/ordenes/nueva",
    "nombre": "Nueva orden de guardia",
    "modulo": "guardias"
  },
  {
    "ruta": "/dashboard/guardias/pernoctes",
    "nombre": "Pernoctes",
    "modulo": "guardias"
  },
  {
    "ruta": "/dashboard/guardias/requisitos",
    "nombre": "Requisitos de rol",
    "modulo": "guardias"
  },
  {
    "ruta": "/dashboard/guardias/sorteos",
    "nombre": "Sorteos",
    "modulo": "guardias"
  },
  {
    "ruta": "/dashboard/inteligencia",
    "nombre": "Inteligencia artificial",
    "modulo": "inteligencia"
  },
  {
    "ruta": "/dashboard/mi-perfil",
    "nombre": "Mi perfil",
    "modulo": "mi-perfil"
  },
  {
    "ruta": "/dashboard/mi-perfil/preferencias",
    "nombre": "Preferencias",
    "modulo": "mi-perfil"
  },
  {
    "ruta": "/dashboard/mi-perfil/seguridad",
    "nombre": "Seguridad",
    "modulo": "mi-perfil"
  },
  {
    "ruta": "/dashboard/organizacion",
    "nombre": "Resumen",
    "modulo": "organizacion"
  },
  {
    "ruta": "/dashboard/organizacion/ascensos",
    "nombre": "Ascensos",
    "modulo": "organizacion"
  },
  {
    "ruta": "/dashboard/organizacion/brigadas",
    "nombre": "Brigadas",
    "modulo": "organizacion"
  },
  {
    "ruta": "/dashboard/organizacion/cargos",
    "nombre": "Cargos",
    "modulo": "organizacion"
  },
  {
    "ruta": "/dashboard/organizacion/companias",
    "nombre": "Compañías",
    "modulo": "organizacion"
  },
  {
    "ruta": "/dashboard/organizacion/cuarteles",
    "nombre": "Cuarteles",
    "modulo": "organizacion"
  },
  {
    "ruta": "/dashboard/organizacion/departamentos",
    "nombre": "Departamentos",
    "modulo": "organizacion"
  },
  {
    "ruta": "/dashboard/organizacion/designaciones",
    "nombre": "Designaciones",
    "modulo": "organizacion"
  },
  {
    "ruta": "/dashboard/organizacion/documentos",
    "nombre": "Configuración de documentos",
    "modulo": "organizacion"
  },
  {
    "ruta": "/dashboard/organizacion/especialidades",
    "nombre": "Especialidades",
    "modulo": "organizacion"
  },
  {
    "ruta": "/dashboard/organizacion/feriados",
    "nombre": "Feriados",
    "modulo": "organizacion"
  },
  {
    "ruta": "/dashboard/organizacion/guardias",
    "nombre": "Guardias",
    "modulo": "organizacion"
  },
  {
    "ruta": "/dashboard/organizacion/guardias/planificacion",
    "nombre": "Planificación de guardias",
    "modulo": "organizacion"
  },
  {
    "ruta": "/dashboard/organizacion/parametros",
    "nombre": "Parámetros",
    "modulo": "organizacion"
  },
  {
    "ruta": "/dashboard/organizacion/rangos",
    "nombre": "Rangos",
    "modulo": "organizacion"
  },
  {
    "ruta": "/dashboard/organizacion/reportes",
    "nombre": "Reportes",
    "modulo": "organizacion"
  },
  {
    "ruta": "/dashboard/organizacion/tipos-bombero",
    "nombre": "Tipos de bombero",
    "modulo": "organizacion"
  },
  {
    "ruta": "/dashboard/organizacion/turnos",
    "nombre": "Turnos",
    "modulo": "organizacion"
  },
  {
    "ruta": "/dashboard/organizacion/unidades",
    "nombre": "Unidades",
    "modulo": "organizacion"
  },
  {
    "ruta": "/dashboard/personal",
    "nombre": "Personal",
    "modulo": "personal"
  },
  {
    "ruta": "/dashboard/personal/nuevo",
    "nombre": "Nuevo bombero",
    "modulo": "personal"
  },
  {
    "ruta": "/dashboard/publicaciones",
    "nombre": "Publicaciones",
    "modulo": "publicaciones"
  },
  {
    "ruta": "/dashboard/seguridad",
    "nombre": "Resumen",
    "modulo": "seguridad"
  },
  {
    "ruta": "/dashboard/seguridad/apariencia",
    "nombre": "Apariencia",
    "modulo": "seguridad"
  },
  {
    "ruta": "/dashboard/seguridad/auditoria",
    "nombre": "Auditoría",
    "modulo": "seguridad"
  },
  {
    "ruta": "/dashboard/seguridad/configuracion",
    "nombre": "Configuración global",
    "modulo": "seguridad"
  },
  {
    "ruta": "/dashboard/seguridad/inteligencia-artificial",
    "nombre": "Inteligencia artificial",
    "modulo": "seguridad"
  },
  {
    "ruta": "/dashboard/seguridad/inteligencia-artificial/auditoria",
    "nombre": "Auditoría de IA",
    "modulo": "seguridad"
  },
  {
    "ruta": "/dashboard/seguridad/inteligencia-artificial/configuracion",
    "nombre": "Configuración de IA",
    "modulo": "seguridad"
  },
  {
    "ruta": "/dashboard/seguridad/inteligencia-artificial/conversaciones",
    "nombre": "Conversaciones",
    "modulo": "seguridad"
  },
  {
    "ruta": "/dashboard/seguridad/inteligencia-artificial/propuestas",
    "nombre": "Propuestas de mejora",
    "modulo": "seguridad"
  },
  {
    "ruta": "/dashboard/seguridad/permisos",
    "nombre": "Permisos",
    "modulo": "seguridad"
  },
  {
    "ruta": "/dashboard/seguridad/roles",
    "nombre": "Roles",
    "modulo": "seguridad"
  },
  {
    "ruta": "/dashboard/seguridad/sesiones",
    "nombre": "Sesiones",
    "modulo": "seguridad"
  },
  {
    "ruta": "/dashboard/seguridad/usuarios",
    "nombre": "Usuarios",
    "modulo": "seguridad"
  },
  {
    "ruta": "/dashboard/servicios",
    "nombre": "Servicios",
    "modulo": "servicios"
  },
  {
    "ruta": "/dashboard/servicios/nuevo",
    "nombre": "Nuevo servicio",
    "modulo": "servicios"
  },
  {
    "ruta": "/dashboard/vehiculos",
    "nombre": "Vehículos",
    "modulo": "vehiculos"
  },
  {
    "ruta": "/dashboard/vehiculos/checklist-items",
    "nombre": "Catálogo de checklist",
    "modulo": "vehiculos"
  }
];
