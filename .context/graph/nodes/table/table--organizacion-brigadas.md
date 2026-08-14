---
id: table--organizacion-brigadas
tipo: TABLE
nombre: organizacion.brigadas
nivel: L2
dominio: organizacion
resumen: Tabla organizacion.brigadas (10 columnas). Creada en 012_organizacion.sql, modificada por 012_organizacion.sql.
tabla: brigadas
archivos:
  - database/migrations/012_organizacion.sql
edges:
  - [defined_in, file--012-organizacion]
  - [belongs_to, domain--organizacion]
terminos: [organizacion, brigadas, codigo, nombre, descripcion, estado, creado, actualizado, eliminado]
---

# organizacion.brigadas

Tabla organizacion.brigadas (10 columnas). Creada en 012_organizacion.sql, modificada por 012_organizacion.sql.

- **Esquema:** organizacion · **Columnas:** 10
- **UNIQUE:** `codigo`, `nombre`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(20) |
| nombre | NVARCHAR(100) |
| descripcion | NVARCHAR(MAX) |
| estado | NVARCHAR(20) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| eliminado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/organizacion/brigadas`, `/dashboard/organizacion/unidades`
- **Endpoints:** BrigadasController
- **Servicios:** BrigadasService, DashboardService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/012_organizacion.sql`

## Relaciones

- `defined_in` → [[file--012-organizacion|012_organizacion.sql]]
- `belongs_to` → [[domain--organizacion|Organización Institucional]]

## Referenciado por

- [[table--organizacion-unidades|organizacion.unidades]] `references` →
- [[entity--brigada|Brigada]] `persisted_in` →
- [[service--organizacion-brigadas|BrigadasService]] `reads` →
- [[service--organizacion-dashboard|DashboardService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
