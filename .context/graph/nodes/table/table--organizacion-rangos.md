---
id: table--organizacion-rangos
tipo: TABLE
nombre: organizacion.rangos
nivel: L2
dominio: organizacion
resumen: Tabla organizacion.rangos (15 columnas). Creada en 012_organizacion.sql, modificada por 012_organizacion.sql.
tabla: rangos
archivos:
  - database/migrations/012_organizacion.sql
edges:
  - [defined_in, file--012-organizacion]
  - [belongs_to, domain--organizacion]
terminos: [organizacion, rangos, codigo, nombre, nivel, jerarquico, descripcion, insignia, url, color, orden, estado, observaciones, creado, actualizado, eliminado]
---

# organizacion.rangos

Tabla organizacion.rangos (15 columnas). Creada en 012_organizacion.sql, modificada por 012_organizacion.sql.

- **Esquema:** organizacion · **Columnas:** 15
- **UNIQUE:** `codigo`, `nombre`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(20) |
| nombre | NVARCHAR(100) |
| nivel_jerarquico | INT |
| descripcion | NVARCHAR(MAX) |
| insignia_url | NVARCHAR(MAX) |
| color | NVARCHAR(7) |
| orden_jerarquico | INT |
| estado | NVARCHAR(20) |
| observaciones | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| eliminado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/academia`, `/dashboard/academia/[id]`, `/dashboard/academia/cursos-externos`, `/dashboard/academia/instructores-externos`, `/dashboard/documentos`, `/dashboard/documentos/[id]`, `/dashboard/documentos/auditoria`, `/dashboard/documentos/expedientes`, `/dashboard/documentos/expedientes/[id]`, `/dashboard/documentos/listado`, `/dashboard/documentos/plantillas`, `/dashboard/documentos/vencimientos`, `/dashboard/finanzas`, `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores/[id]`, `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/planificacion`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/ascensos`, `/dashboard/organizacion/documentos`, `/dashboard/organizacion/feriados`, `/dashboard/organizacion/rangos`
- **Endpoints:** ActividadesAcademicasController, AscensosController, FirmasDocumentoController, FojaServicioController, GuardiasController, InscripcionesAcademiaController, OrdenesGuardiaController, PlantillasController, RangosController, ReportesAcademiaController, ReportesFinanzasController
- **Servicios:** ActividadesAcademicasService, AscensosService, DashboardService, ElegibilidadService, FirmasDocumentoService, FojaServicioService, GeneracionService, IaToolsService, InscripcionesAcademiaService, OrdenesGuardiaService, PlantillasService, RangosService, ReportesAcademiaService, ReportesFinanzasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/012_organizacion.sql`

## Relaciones

- `defined_in` → [[file--012-organizacion|012_organizacion.sql]]
- `belongs_to` → [[domain--organizacion|Organización Institucional]]

## Referenciado por

- [[table--organizacion-ascensos|organizacion.ascensos]] `references` →
- [[table--organizacion-ascensos|organizacion.ascensos]] `references` →
- [[table--operaciones-requisitos-rol-guardia|operaciones.requisitos_rol_guardia]] `references` →
- [[entity--rango|Rango]] `persisted_in` →
- [[service--academia-actividades-academicas|ActividadesAcademicasService]] `reads` →
- [[service--academia-inscripciones-academia|InscripcionesAcademiaService]] `reads` →
- [[service--academia-reportes-academia|ReportesAcademiaService]] `reads` →
- [[service--documentos-firmas-documento|FirmasDocumentoService]] `reads` →
- [[service--documentos-plantillas|PlantillasService]] `reads` →
- [[service--finanzas-reportes-finanzas|ReportesFinanzasService]] `reads` →
- [[service--guardias-elegibilidad|ElegibilidadService]] `reads` →
- [[service--guardias-generacion|GeneracionService]] `reads` →
- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `reads` →
- [[service--ia-ia-tools|IaToolsService]] `reads` →
- [[service--organizacion-ascensos|AscensosService]] `reads` →
- [[service--organizacion-dashboard|DashboardService]] `reads` →
- [[service--organizacion-rangos|RangosService]] `reads` →
- [[service--personal-foja-servicio|FojaServicioService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
