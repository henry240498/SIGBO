// GENERADO por scripts/generar-pantallas.mjs — no editar a mano.
// Volver a generar con: npm run generar:pantallas

export interface PantallaRegistrada {
  /** Ruta absoluta; las de detalle llevan el parametro entre corchetes ('/dashboard/personal/[id]'). */
  ruta: string;
  /** Nombre legible: el del submenu si existe, si no derivado del slug. */
  nombre: string;
  /** Slug del modulo al que pertenece, para filtrar por permisos. */
  modulo: string;
  /** Codigo en la matriz de permisos por pantalla; null = fuera de la matriz (Inicio, Mi perfil, Reportar). */
  codigo: string | null;
  /** Pantalla de detalle (ruta con parametro): no es un destino del buscador. */
  detalle: boolean;
}

export const PANTALLAS: PantallaRegistrada[] = [
  {
    "ruta": "/dashboard",
    "nombre": "Inicio",
    "modulo": "inicio",
    "codigo": null,
    "detalle": false
  },
  {
    "ruta": "/dashboard/academia",
    "nombre": "Actividades",
    "modulo": "academia",
    "codigo": "0xB001",
    "detalle": false
  },
  {
    "ruta": "/dashboard/academia/[id]",
    "nombre": "Detalle de curso",
    "modulo": "academia",
    "codigo": "0xB002",
    "detalle": true
  },
  {
    "ruta": "/dashboard/academia/cursos-externos",
    "nombre": "Cursos externos (OBA)",
    "modulo": "academia",
    "codigo": "0xB003",
    "detalle": false
  },
  {
    "ruta": "/dashboard/academia/instructores-externos",
    "nombre": "Instructores externos",
    "modulo": "academia",
    "codigo": "0xB004",
    "detalle": false
  },
  {
    "ruta": "/dashboard/asistencia",
    "nombre": "Resumen",
    "modulo": "asistencia",
    "codigo": "0xB005",
    "detalle": false
  },
  {
    "ruta": "/dashboard/asistencia/auditoria",
    "nombre": "Auditoría",
    "modulo": "asistencia",
    "codigo": "0xB006",
    "detalle": false
  },
  {
    "ruta": "/dashboard/asistencia/ausencias",
    "nombre": "Ausencias",
    "modulo": "asistencia",
    "codigo": "0xB007",
    "detalle": false
  },
  {
    "ruta": "/dashboard/asistencia/eventos",
    "nombre": "Eventos",
    "modulo": "asistencia",
    "codigo": "0xB008",
    "detalle": false
  },
  {
    "ruta": "/dashboard/asistencia/eventos/[id]",
    "nombre": "Detalle de evento de asistencia",
    "modulo": "asistencia",
    "codigo": "0xB009",
    "detalle": true
  },
  {
    "ruta": "/dashboard/asistencia/externos",
    "nombre": "Personas externas",
    "modulo": "asistencia",
    "codigo": "0xB00A",
    "detalle": false
  },
  {
    "ruta": "/dashboard/asistencia/registro",
    "nombre": "Registro",
    "modulo": "asistencia",
    "codigo": "0xB00B",
    "detalle": false
  },
  {
    "ruta": "/dashboard/asistencia/tolerancias",
    "nombre": "Tolerancias",
    "modulo": "asistencia",
    "codigo": "0xB00C",
    "detalle": false
  },
  {
    "ruta": "/dashboard/denuncias",
    "nombre": "Denuncias",
    "modulo": "denuncias",
    "codigo": "0xB00D",
    "detalle": false
  },
  {
    "ruta": "/dashboard/denuncias/[id]",
    "nombre": "Detalle de denuncia",
    "modulo": "denuncias",
    "codigo": "0xB00E",
    "detalle": true
  },
  {
    "ruta": "/dashboard/deposito",
    "nombre": "Resumen",
    "modulo": "deposito",
    "codigo": "0xB00F",
    "detalle": false
  },
  {
    "ruta": "/dashboard/deposito/articulos",
    "nombre": "Artículos",
    "modulo": "deposito",
    "codigo": "0xB010",
    "detalle": false
  },
  {
    "ruta": "/dashboard/deposito/articulos/[id]",
    "nombre": "Ficha de artículo",
    "modulo": "deposito",
    "codigo": "0xB011",
    "detalle": true
  },
  {
    "ruta": "/dashboard/deposito/bajas",
    "nombre": "Bajas",
    "modulo": "deposito",
    "codigo": "0xB012",
    "detalle": false
  },
  {
    "ruta": "/dashboard/deposito/categorias",
    "nombre": "Categorías",
    "modulo": "deposito",
    "codigo": "0xB013",
    "detalle": false
  },
  {
    "ruta": "/dashboard/deposito/entradas",
    "nombre": "Entradas",
    "modulo": "deposito",
    "codigo": "0xB014",
    "detalle": false
  },
  {
    "ruta": "/dashboard/deposito/incidencias",
    "nombre": "Incidencias",
    "modulo": "deposito",
    "codigo": "0xB015",
    "detalle": false
  },
  {
    "ruta": "/dashboard/deposito/inventarios-fisicos",
    "nombre": "Inventarios físicos",
    "modulo": "deposito",
    "codigo": "0xB016",
    "detalle": false
  },
  {
    "ruta": "/dashboard/deposito/inventarios-fisicos/[id]",
    "nombre": "Detalle de inventario físico",
    "modulo": "deposito",
    "codigo": "0xB017",
    "detalle": true
  },
  {
    "ruta": "/dashboard/deposito/mantenimientos",
    "nombre": "Mantenimientos",
    "modulo": "deposito",
    "codigo": "0xB018",
    "detalle": false
  },
  {
    "ruta": "/dashboard/deposito/movimientos",
    "nombre": "Movimientos",
    "modulo": "deposito",
    "codigo": "0xB019",
    "detalle": false
  },
  {
    "ruta": "/dashboard/deposito/prestamos",
    "nombre": "Préstamos",
    "modulo": "deposito",
    "codigo": "0xB01A",
    "detalle": false
  },
  {
    "ruta": "/dashboard/deposito/proveedores",
    "nombre": "Proveedores",
    "modulo": "deposito",
    "codigo": "0xB01B",
    "detalle": false
  },
  {
    "ruta": "/dashboard/deposito/ubicaciones",
    "nombre": "Ubicaciones",
    "modulo": "deposito",
    "codigo": "0xB01C",
    "detalle": false
  },
  {
    "ruta": "/dashboard/documentos",
    "nombre": "Resumen",
    "modulo": "documentos",
    "codigo": "0xB01D",
    "detalle": false
  },
  {
    "ruta": "/dashboard/documentos/[id]",
    "nombre": "Detalle de documento",
    "modulo": "documentos",
    "codigo": "0xB01E",
    "detalle": true
  },
  {
    "ruta": "/dashboard/documentos/auditoria",
    "nombre": "Auditoría",
    "modulo": "documentos",
    "codigo": "0xB01F",
    "detalle": false
  },
  {
    "ruta": "/dashboard/documentos/expedientes",
    "nombre": "Expedientes",
    "modulo": "documentos",
    "codigo": "0xB020",
    "detalle": false
  },
  {
    "ruta": "/dashboard/documentos/expedientes/[id]",
    "nombre": "Detalle de expediente",
    "modulo": "documentos",
    "codigo": "0xB021",
    "detalle": true
  },
  {
    "ruta": "/dashboard/documentos/listado",
    "nombre": "Documentos",
    "modulo": "documentos",
    "codigo": "0xB022",
    "detalle": false
  },
  {
    "ruta": "/dashboard/documentos/plantillas",
    "nombre": "Plantillas",
    "modulo": "documentos",
    "codigo": "0xB023",
    "detalle": false
  },
  {
    "ruta": "/dashboard/documentos/vencimientos",
    "nombre": "Vencimientos",
    "modulo": "documentos",
    "codigo": "0xB024",
    "detalle": false
  },
  {
    "ruta": "/dashboard/equipos",
    "nombre": "Equipos",
    "modulo": "equipos",
    "codigo": "0xB025",
    "detalle": false
  },
  {
    "ruta": "/dashboard/equipos/[id]",
    "nombre": "Ficha de equipo",
    "modulo": "equipos",
    "codigo": "0xB026",
    "detalle": true
  },
  {
    "ruta": "/dashboard/equipos/categorias",
    "nombre": "Categorías",
    "modulo": "equipos",
    "codigo": "0xB027",
    "detalle": false
  },
  {
    "ruta": "/dashboard/finanzas",
    "nombre": "Resumen",
    "modulo": "finanzas",
    "codigo": "0xB028",
    "detalle": false
  },
  {
    "ruta": "/dashboard/finanzas/beneficios",
    "nombre": "Beneficios",
    "modulo": "finanzas",
    "codigo": "0xB029",
    "detalle": false
  },
  {
    "ruta": "/dashboard/finanzas/cajas",
    "nombre": "Cajas",
    "modulo": "finanzas",
    "codigo": "0xB02A",
    "detalle": false
  },
  {
    "ruta": "/dashboard/finanzas/cuentas-bancarias",
    "nombre": "Cuentas bancarias",
    "modulo": "finanzas",
    "codigo": "0xB02B",
    "detalle": false
  },
  {
    "ruta": "/dashboard/finanzas/cuotas",
    "nombre": "Cuotas",
    "modulo": "finanzas",
    "codigo": "0xB02C",
    "detalle": false
  },
  {
    "ruta": "/dashboard/finanzas/ejercicios-fiscales",
    "nombre": "Ejercicios fiscales",
    "modulo": "finanzas",
    "codigo": "0xB02D",
    "detalle": false
  },
  {
    "ruta": "/dashboard/finanzas/facturacion",
    "nombre": "Facturación",
    "modulo": "finanzas",
    "codigo": "0xB02E",
    "detalle": false
  },
  {
    "ruta": "/dashboard/finanzas/movimientos",
    "nombre": "Movimientos",
    "modulo": "finanzas",
    "codigo": "0xB02F",
    "detalle": false
  },
  {
    "ruta": "/dashboard/finanzas/movimientos-bancarios",
    "nombre": "Conciliación",
    "modulo": "finanzas",
    "codigo": "0xB030",
    "detalle": false
  },
  {
    "ruta": "/dashboard/finanzas/ordenes-pago",
    "nombre": "Órdenes de pago",
    "modulo": "finanzas",
    "codigo": "0xB031",
    "detalle": false
  },
  {
    "ruta": "/dashboard/finanzas/presupuesto",
    "nombre": "Presupuesto",
    "modulo": "finanzas",
    "codigo": "0xB032",
    "detalle": false
  },
  {
    "ruta": "/dashboard/finanzas/socios-protectores",
    "nombre": "Socios protectores",
    "modulo": "finanzas",
    "codigo": "0xB033",
    "detalle": false
  },
  {
    "ruta": "/dashboard/finanzas/socios-protectores/[id]",
    "nombre": "Ficha de socio protector",
    "modulo": "finanzas",
    "codigo": "0xB034",
    "detalle": true
  },
  {
    "ruta": "/dashboard/guardias",
    "nombre": "Guardias",
    "modulo": "guardias",
    "codigo": "0xB035",
    "detalle": false
  },
  {
    "ruta": "/dashboard/guardias/[id]",
    "nombre": "Detalle de guardia",
    "modulo": "guardias",
    "codigo": "0xB036",
    "detalle": true
  },
  {
    "ruta": "/dashboard/guardias/auditoria",
    "nombre": "Auditoría",
    "modulo": "guardias",
    "codigo": "0xB037",
    "detalle": false
  },
  {
    "ruta": "/dashboard/guardias/esquemas-horario",
    "nombre": "Esquemas de horario",
    "modulo": "guardias",
    "codigo": "0xB038",
    "detalle": false
  },
  {
    "ruta": "/dashboard/guardias/generar",
    "nombre": "Generar",
    "modulo": "guardias",
    "codigo": "0xB039",
    "detalle": false
  },
  {
    "ruta": "/dashboard/guardias/grupos",
    "nombre": "Grupos",
    "modulo": "guardias",
    "codigo": "0xB03A",
    "detalle": false
  },
  {
    "ruta": "/dashboard/guardias/grupos/[id]",
    "nombre": "Detalle de grupo de guardia",
    "modulo": "guardias",
    "codigo": "0xB03B",
    "detalle": true
  },
  {
    "ruta": "/dashboard/guardias/ordenes",
    "nombre": "Órdenes de guardia",
    "modulo": "guardias",
    "codigo": "0xB03C",
    "detalle": false
  },
  {
    "ruta": "/dashboard/guardias/ordenes/[id]",
    "nombre": "Detalle de orden de guardia",
    "modulo": "guardias",
    "codigo": "0xB03D",
    "detalle": true
  },
  {
    "ruta": "/dashboard/guardias/ordenes/configuracion",
    "nombre": "Configuración de órdenes",
    "modulo": "guardias",
    "codigo": "0xB03E",
    "detalle": false
  },
  {
    "ruta": "/dashboard/guardias/ordenes/nueva",
    "nombre": "Nueva orden de guardia",
    "modulo": "guardias",
    "codigo": "0xB03F",
    "detalle": false
  },
  {
    "ruta": "/dashboard/guardias/pernoctes",
    "nombre": "Pernoctes",
    "modulo": "guardias",
    "codigo": "0xB040",
    "detalle": false
  },
  {
    "ruta": "/dashboard/guardias/planificacion",
    "nombre": "Planificación",
    "modulo": "guardias",
    "codigo": "0xB041",
    "detalle": false
  },
  {
    "ruta": "/dashboard/guardias/requisitos",
    "nombre": "Requisitos de rol",
    "modulo": "guardias",
    "codigo": "0xB042",
    "detalle": false
  },
  {
    "ruta": "/dashboard/guardias/sorteos",
    "nombre": "Sorteos",
    "modulo": "guardias",
    "codigo": "0xB043",
    "detalle": false
  },
  {
    "ruta": "/dashboard/guardias/sorteos/[id]",
    "nombre": "Detalle de sorteo",
    "modulo": "guardias",
    "codigo": "0xB044",
    "detalle": true
  },
  {
    "ruta": "/dashboard/inteligencia",
    "nombre": "Inteligencia artificial",
    "modulo": "inteligencia",
    "codigo": "0xB045",
    "detalle": false
  },
  {
    "ruta": "/dashboard/mi-perfil",
    "nombre": "Mi perfil",
    "modulo": "mi-perfil",
    "codigo": null,
    "detalle": false
  },
  {
    "ruta": "/dashboard/mi-perfil/preferencias",
    "nombre": "Preferencias",
    "modulo": "mi-perfil",
    "codigo": null,
    "detalle": false
  },
  {
    "ruta": "/dashboard/mi-perfil/seguridad",
    "nombre": "Seguridad",
    "modulo": "mi-perfil",
    "codigo": null,
    "detalle": false
  },
  {
    "ruta": "/dashboard/organizacion",
    "nombre": "Resumen",
    "modulo": "organizacion",
    "codigo": "0xB046",
    "detalle": false
  },
  {
    "ruta": "/dashboard/organizacion/ascensos",
    "nombre": "Ascensos",
    "modulo": "organizacion",
    "codigo": "0xB047",
    "detalle": false
  },
  {
    "ruta": "/dashboard/organizacion/brigadas",
    "nombre": "Brigadas",
    "modulo": "organizacion",
    "codigo": "0xB048",
    "detalle": false
  },
  {
    "ruta": "/dashboard/organizacion/cargos",
    "nombre": "Cargos",
    "modulo": "organizacion",
    "codigo": "0xB049",
    "detalle": false
  },
  {
    "ruta": "/dashboard/organizacion/companias",
    "nombre": "Compañías",
    "modulo": "organizacion",
    "codigo": "0xB04A",
    "detalle": false
  },
  {
    "ruta": "/dashboard/organizacion/cuarteles",
    "nombre": "Cuarteles",
    "modulo": "organizacion",
    "codigo": "0xB04B",
    "detalle": false
  },
  {
    "ruta": "/dashboard/organizacion/departamentos",
    "nombre": "Departamentos",
    "modulo": "organizacion",
    "codigo": "0xB04C",
    "detalle": false
  },
  {
    "ruta": "/dashboard/organizacion/designaciones",
    "nombre": "Designaciones",
    "modulo": "organizacion",
    "codigo": "0xB04D",
    "detalle": false
  },
  {
    "ruta": "/dashboard/organizacion/documentos",
    "nombre": "Configuración de documentos",
    "modulo": "organizacion",
    "codigo": "0xB04E",
    "detalle": false
  },
  {
    "ruta": "/dashboard/organizacion/especialidades",
    "nombre": "Especialidades",
    "modulo": "organizacion",
    "codigo": "0xB04F",
    "detalle": false
  },
  {
    "ruta": "/dashboard/organizacion/feriados",
    "nombre": "Feriados",
    "modulo": "organizacion",
    "codigo": "0xB050",
    "detalle": false
  },
  {
    "ruta": "/dashboard/organizacion/parametros",
    "nombre": "Parámetros",
    "modulo": "organizacion",
    "codigo": "0xB051",
    "detalle": false
  },
  {
    "ruta": "/dashboard/organizacion/rangos",
    "nombre": "Rangos",
    "modulo": "organizacion",
    "codigo": "0xB052",
    "detalle": false
  },
  {
    "ruta": "/dashboard/organizacion/reportes",
    "nombre": "Reportes",
    "modulo": "organizacion",
    "codigo": "0xB053",
    "detalle": false
  },
  {
    "ruta": "/dashboard/organizacion/tipos-bombero",
    "nombre": "Tipos de bombero",
    "modulo": "organizacion",
    "codigo": "0xB054",
    "detalle": false
  },
  {
    "ruta": "/dashboard/organizacion/tipos-guardia",
    "nombre": "Tipos de guardia",
    "modulo": "organizacion",
    "codigo": "0xB055",
    "detalle": false
  },
  {
    "ruta": "/dashboard/organizacion/turnos",
    "nombre": "Turnos",
    "modulo": "organizacion",
    "codigo": "0xB056",
    "detalle": false
  },
  {
    "ruta": "/dashboard/organizacion/unidades",
    "nombre": "Unidades",
    "modulo": "organizacion",
    "codigo": "0xB057",
    "detalle": false
  },
  {
    "ruta": "/dashboard/personal",
    "nombre": "Personal",
    "modulo": "personal",
    "codigo": "0xB058",
    "detalle": false
  },
  {
    "ruta": "/dashboard/personal/[id]",
    "nombre": "Legajo del bombero",
    "modulo": "personal",
    "codigo": "0xB059",
    "detalle": true
  },
  {
    "ruta": "/dashboard/personal/control",
    "nombre": "Control: vencimientos, horas y fichaje",
    "modulo": "personal",
    "codigo": "0xB05A",
    "detalle": false
  },
  {
    "ruta": "/dashboard/personal/nuevo",
    "nombre": "Nuevo bombero",
    "modulo": "personal",
    "codigo": "0xB05B",
    "detalle": false
  },
  {
    "ruta": "/dashboard/publicaciones",
    "nombre": "Publicaciones",
    "modulo": "publicaciones",
    "codigo": "0xB05C",
    "detalle": false
  },
  {
    "ruta": "/dashboard/reportar",
    "nombre": "Reportar",
    "modulo": "reportar",
    "codigo": null,
    "detalle": false
  },
  {
    "ruta": "/dashboard/reservas",
    "nombre": "Reservas",
    "modulo": "reservas",
    "codigo": "0xB05D",
    "detalle": false
  },
  {
    "ruta": "/dashboard/seguridad",
    "nombre": "Resumen",
    "modulo": "seguridad",
    "codigo": "0xB05E",
    "detalle": false
  },
  {
    "ruta": "/dashboard/seguridad/apariencia",
    "nombre": "Apariencia",
    "modulo": "seguridad",
    "codigo": "0xB05F",
    "detalle": false
  },
  {
    "ruta": "/dashboard/seguridad/auditoria",
    "nombre": "Auditoría",
    "modulo": "seguridad",
    "codigo": "0xB060",
    "detalle": false
  },
  {
    "ruta": "/dashboard/seguridad/configuracion",
    "nombre": "Configuración global",
    "modulo": "seguridad",
    "codigo": "0xB061",
    "detalle": false
  },
  {
    "ruta": "/dashboard/seguridad/inteligencia-artificial",
    "nombre": "Inteligencia artificial",
    "modulo": "seguridad",
    "codigo": "0xB062",
    "detalle": false
  },
  {
    "ruta": "/dashboard/seguridad/inteligencia-artificial/auditoria",
    "nombre": "Auditoría de IA",
    "modulo": "seguridad",
    "codigo": "0xB063",
    "detalle": false
  },
  {
    "ruta": "/dashboard/seguridad/inteligencia-artificial/configuracion",
    "nombre": "Configuración de IA",
    "modulo": "seguridad",
    "codigo": "0xB064",
    "detalle": false
  },
  {
    "ruta": "/dashboard/seguridad/inteligencia-artificial/conversaciones",
    "nombre": "Conversaciones",
    "modulo": "seguridad",
    "codigo": "0xB065",
    "detalle": false
  },
  {
    "ruta": "/dashboard/seguridad/inteligencia-artificial/propuestas",
    "nombre": "Propuestas de mejora",
    "modulo": "seguridad",
    "codigo": "0xB066",
    "detalle": false
  },
  {
    "ruta": "/dashboard/seguridad/navegacion",
    "nombre": "Navegación",
    "modulo": "seguridad",
    "codigo": "0xB067",
    "detalle": false
  },
  {
    "ruta": "/dashboard/seguridad/pantallas",
    "nombre": "Permisos por pantalla",
    "modulo": "seguridad",
    "codigo": "0xB068",
    "detalle": false
  },
  {
    "ruta": "/dashboard/seguridad/permisos",
    "nombre": "Permisos",
    "modulo": "seguridad",
    "codigo": "0xB069",
    "detalle": false
  },
  {
    "ruta": "/dashboard/seguridad/roles",
    "nombre": "Roles",
    "modulo": "seguridad",
    "codigo": "0xB06A",
    "detalle": false
  },
  {
    "ruta": "/dashboard/seguridad/sesiones",
    "nombre": "Sesiones",
    "modulo": "seguridad",
    "codigo": "0xB06B",
    "detalle": false
  },
  {
    "ruta": "/dashboard/seguridad/usuarios",
    "nombre": "Usuarios",
    "modulo": "seguridad",
    "codigo": "0xB06C",
    "detalle": false
  },
  {
    "ruta": "/dashboard/seguridad/usuarios/[id]",
    "nombre": "Ficha de usuario",
    "modulo": "seguridad",
    "codigo": "0xB06D",
    "detalle": true
  },
  {
    "ruta": "/dashboard/servicios",
    "nombre": "Comunicaciones",
    "modulo": "servicios",
    "codigo": "0xB06E",
    "detalle": false
  },
  {
    "ruta": "/dashboard/servicios/cartografia",
    "nombre": "Hidrantes y riesgos",
    "modulo": "servicios",
    "codigo": "0xB06F",
    "detalle": false
  },
  {
    "ruta": "/dashboard/servicios/convocatorias",
    "nombre": "Convocatorias",
    "modulo": "servicios",
    "codigo": "0xB070",
    "detalle": false
  },
  {
    "ruta": "/dashboard/servicios/despacho",
    "nombre": "Despacho operativo",
    "modulo": "servicios",
    "codigo": "0xB071",
    "detalle": false
  },
  {
    "ruta": "/dashboard/servicios/indicadores",
    "nombre": "Indicadores",
    "modulo": "servicios",
    "codigo": "0xB072",
    "detalle": false
  },
  {
    "ruta": "/dashboard/servicios/llamados",
    "nombre": "Llamados",
    "modulo": "servicios",
    "codigo": "0xB073",
    "detalle": false
  },
  {
    "ruta": "/dashboard/servicios/nuevo",
    "nombre": "Nuevo servicio",
    "modulo": "servicios",
    "codigo": "0xB074",
    "detalle": false
  },
  {
    "ruta": "/dashboard/servicios/prevencion",
    "nombre": "Prevención",
    "modulo": "servicios",
    "codigo": "0xB075",
    "detalle": false
  },
  {
    "ruta": "/dashboard/vehiculos",
    "nombre": "Vehículos",
    "modulo": "vehiculos",
    "codigo": "0xB076",
    "detalle": false
  },
  {
    "ruta": "/dashboard/vehiculos/[id]",
    "nombre": "Ficha de vehículo",
    "modulo": "vehiculos",
    "codigo": "0xB077",
    "detalle": true
  },
  {
    "ruta": "/dashboard/vehiculos/checklist-items",
    "nombre": "Catálogo de checklist",
    "modulo": "vehiculos",
    "codigo": "0xB078",
    "detalle": false
  },
  {
    "ruta": "/dashboard/vehiculos/dotacion",
    "nombre": "Dotación y bitácora",
    "modulo": "vehiculos",
    "codigo": "0xB079",
    "detalle": false
  },
  {
    "ruta": "/dashboard/vehiculos/flota",
    "nombre": "Flota en vivo",
    "modulo": "vehiculos",
    "codigo": "0xB07A",
    "detalle": false
  },
  {
    "ruta": "/dashboard/vehiculos/mapa",
    "nombre": "Mapa de flota",
    "modulo": "vehiculos",
    "codigo": "0xB07B",
    "detalle": false
  }
];
