---
id: table--organizacion-unidades
tipo: TABLE
nombre: organizacion.unidades
nivel: L2
dominio: organizacion
resumen: Tabla organizacion.unidades (11 columnas). Creada en 012_organizacion.sql, modificada por 012_organizacion.sql.
tabla: unidades
archivos:
  - database/migrations/012_organizacion.sql
edges:
  - [defined_in, file--012-organizacion]
  - [belongs_to, domain--organizacion]
  - [references, table--organizacion-brigadas]
terminos: [organizacion, unidades, codigo, nombre, descripcion, brigada, estado, creado, actualizado, eliminado]
---

# organizacion.unidades

Tabla organizacion.unidades (11 columnas). Creada en 012_organizacion.sql, modificada por 012_organizacion.sql.

- **Esquema:** organizacion · **Columnas:** 11
- **UNIQUE:** `codigo`

## Llaves foraneas

- `brigada_id` → [[table--organizacion-brigadas|organizacion.brigadas]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(20) |
| nombre | NVARCHAR(100) |
| descripcion | NVARCHAR(MAX) |
| brigada_id | UNIQUEIDENTIFIER |
| estado | NVARCHAR(20) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| eliminado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/organizacion/unidades`
- **Endpoints:** UnidadesController
- **Servicios:** DashboardService, UnidadesService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/012_organizacion.sql`

## Relaciones

- `defined_in` → [[file--012-organizacion|012_organizacion.sql]]
- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `references` → [[table--organizacion-brigadas|organizacion.brigadas]]

## Referenciado por

- [[entity--unidad|Unidad]] `persisted_in` →
- [[service--organizacion-dashboard|DashboardService]] `reads` →
- [[service--organizacion-unidades|UnidadesService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
