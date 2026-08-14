---
id: table--organizacion-designaciones
tipo: TABLE
nombre: organizacion.designaciones
nivel: L2
dominio: organizacion
resumen: Tabla organizacion.designaciones (16 columnas). Creada en 012_organizacion.sql, modificada por 012_organizacion.sql.
tabla: designaciones
archivos:
  - database/migrations/012_organizacion.sql
edges:
  - [defined_in, file--012-organizacion]
  - [belongs_to, domain--organizacion]
  - [references, table--personal-bomberos]
  - [references, table--organizacion-cargos]
  - [references, table--organizacion-companias]
  - [references, table--organizacion-cuarteles]
terminos: [organizacion, designaciones, codigo, bombero, cargo, compania, cuartel, fecha, desde, hasta, estado, motivo, observaciones, creado, actualizado, eliminado]
---

# organizacion.designaciones

Tabla organizacion.designaciones (16 columnas). Creada en 012_organizacion.sql, modificada por 012_organizacion.sql.

- **Esquema:** organizacion · **Columnas:** 16

## Llaves foraneas

- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]
- `cargo_id` → [[table--organizacion-cargos|organizacion.cargos]]
- `compania_id` → [[table--organizacion-companias|organizacion.companias]]
- `cuartel_id` → [[table--organizacion-cuarteles|organizacion.cuarteles]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(30) |
| bombero_id | UNIQUEIDENTIFIER |
| cargo_id | UNIQUEIDENTIFIER |
| compania_id | UNIQUEIDENTIFIER |
| cuartel_id | UNIQUEIDENTIFIER |
| fecha_desde | DATE |
| fecha_hasta | DATE |
| estado | NVARCHAR(20) |
| motivo | NVARCHAR(MAX) |
| observaciones | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| eliminado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/designaciones`, `/dashboard/organizacion/feriados`, `/dashboard/personal/[id]`
- **Endpoints:** DesignacionesController, FojaServicioController, OrdenesGuardiaController
- **Servicios:** DashboardService, DesignacionesService, FojaServicioService, OrdenesGuardiaService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/012_organizacion.sql`

## Relaciones

- `defined_in` → [[file--012-organizacion|012_organizacion.sql]]
- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `references` → [[table--personal-bomberos|personal.bomberos]]
- `references` → [[table--organizacion-cargos|organizacion.cargos]]
- `references` → [[table--organizacion-companias|organizacion.companias]]
- `references` → [[table--organizacion-cuarteles|organizacion.cuarteles]]

## Referenciado por

- [[entity--designacion|Designacion]] `persisted_in` →
- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `reads` →
- [[service--organizacion-dashboard|DashboardService]] `reads` →
- [[service--organizacion-designaciones|DesignacionesService]] `reads` →
- [[service--personal-foja-servicio|FojaServicioService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
