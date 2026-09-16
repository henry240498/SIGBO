---
id: table--organizacion-ascensos
tipo: TABLE
nombre: organizacion.ascensos
nivel: L2
dominio: organizacion
resumen: Tabla organizacion.ascensos (15 columnas). Creada en 012_organizacion.sql, modificada por 012_organizacion.sql.
tabla: ascensos
archivos:
  - database/migrations/012_organizacion.sql
edges:
  - [defined_in, file--012-organizacion]
  - [belongs_to, domain--organizacion]
  - [references, table--personal-bomberos]
  - [references, table--organizacion-rangos]
  - [references, table--organizacion-rangos]
terminos: [organizacion, ascensos, codigo, bombero, rango, anterior, nuevo, fecha, resolucion, motivo, observaciones, estado, creado, actualizado, eliminado]
---

# organizacion.ascensos

Tabla organizacion.ascensos (15 columnas). Creada en 012_organizacion.sql, modificada por 012_organizacion.sql.

- **Esquema:** organizacion · **Columnas:** 15

## Llaves foraneas

- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]
- `rango_anterior_id` → [[table--organizacion-rangos|organizacion.rangos]]
- `rango_nuevo_id` → [[table--organizacion-rangos|organizacion.rangos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(30) |
| bombero_id | UNIQUEIDENTIFIER |
| rango_anterior_id | UNIQUEIDENTIFIER |
| rango_nuevo_id | UNIQUEIDENTIFIER |
| fecha | DATE |
| resolucion | NVARCHAR(100) |
| motivo | NVARCHAR(MAX) |
| observaciones | NVARCHAR(MAX) |
| estado | NVARCHAR(20) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| eliminado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/organizacion/ascensos`
- **Endpoints:** AscensosController
- **Servicios:** AscensosService, DashboardService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/012_organizacion.sql`

## Relaciones

- `defined_in` → [[file--012-organizacion|012_organizacion.sql]]
- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `references` → [[table--personal-bomberos|personal.bomberos]]
- `references` → [[table--organizacion-rangos|organizacion.rangos]]
- `references` → [[table--organizacion-rangos|organizacion.rangos]]

## Referenciado por

- [[entity--ascenso|Ascenso]] `persisted_in` →
- [[service--organizacion-ascensos|AscensosService]] `reads` →
- [[service--organizacion-dashboard|DashboardService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
