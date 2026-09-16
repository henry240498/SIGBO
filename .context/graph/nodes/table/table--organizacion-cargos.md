---
id: table--organizacion-cargos
tipo: TABLE
nombre: organizacion.cargos
nivel: L2
dominio: organizacion
resumen: Tabla organizacion.cargos (13 columnas). Creada en 012_organizacion.sql, modificada por 012_organizacion.sql.
tabla: cargos
archivos:
  - database/migrations/012_organizacion.sql
edges:
  - [defined_in, file--012-organizacion]
  - [belongs_to, domain--organizacion]
terminos: [organizacion, cargos, codigo, nombre, descripcion, area, nivel, dependencia, cargo, estado, creado, actualizado, eliminado]
---

# organizacion.cargos

Tabla organizacion.cargos (13 columnas). Creada en 012_organizacion.sql, modificada por 012_organizacion.sql.

- **Esquema:** organizacion · **Columnas:** 13
- **UNIQUE:** `codigo`, `nombre`

## Llaves foraneas

- `dependencia_cargo_id` → [[table--organizacion-cargos|organizacion.cargos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(20) |
| nombre | NVARCHAR(100) |
| descripcion | NVARCHAR(MAX) |
| area | NVARCHAR(100) |
| nivel | INT |
| dependencia_cargo_id | UNIQUEIDENTIFIER |
| estado | NVARCHAR(20) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| eliminado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/documentos`, `/dashboard/documentos/[id]`, `/dashboard/documentos/auditoria`, `/dashboard/documentos/expedientes`, `/dashboard/documentos/expedientes/[id]`, `/dashboard/documentos/listado`, `/dashboard/documentos/plantillas`, `/dashboard/documentos/vencimientos`, `/dashboard/finanzas`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores/[id]`, `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/planificacion`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/cargos`, `/dashboard/organizacion/designaciones`, `/dashboard/organizacion/documentos`, `/dashboard/organizacion/feriados`
- **Endpoints:** CargosController, DesignacionesController, FirmasDocumentoController, FojaServicioController, OrdenesGuardiaController, PlantillasController, ReportesAcademiaController, ReportesFinanzasController
- **Servicios:** CargosService, DashboardService, DesignacionesService, FirmasDocumentoService, FojaServicioService, OrdenesGuardiaService, PlantillasService, ReportesAcademiaService, ReportesFinanzasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/012_organizacion.sql`

## Relaciones

- `defined_in` → [[file--012-organizacion|012_organizacion.sql]]
- `belongs_to` → [[domain--organizacion|Organización Institucional]]

## Referenciado por

- [[table--organizacion-designaciones|organizacion.designaciones]] `references` →
- [[table--operaciones-requisitos-rol-guardia|operaciones.requisitos_rol_guardia]] `references` →
- [[table--operaciones-orden-guardia-configuracion|operaciones.orden_guardia_configuracion]] `references` →
- [[table--operaciones-orden-guardia-configuracion|operaciones.orden_guardia_configuracion]] `references` →
- [[table--documentos-plantillas|documentos.plantillas]] `references` →
- [[table--documentos-firmas-documento|documentos.firmas_documento]] `references` →
- [[entity--cargo|Cargo]] `persisted_in` →
- [[service--academia-reportes-academia|ReportesAcademiaService]] `reads` →
- [[service--documentos-firmas-documento|FirmasDocumentoService]] `reads` →
- [[service--documentos-plantillas|PlantillasService]] `reads` →
- [[service--finanzas-reportes-finanzas|ReportesFinanzasService]] `reads` →
- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `reads` →
- [[service--organizacion-cargos|CargosService]] `reads` →
- [[service--organizacion-dashboard|DashboardService]] `reads` →
- [[service--organizacion-designaciones|DesignacionesService]] `reads` →
- [[service--personal-foja-servicio|FojaServicioService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
