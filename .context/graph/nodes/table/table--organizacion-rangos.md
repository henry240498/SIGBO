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
- [[service--organizacion-ascensos|AscensosService]] `reads` →
- [[service--organizacion-dashboard|DashboardService]] `reads` →
- [[service--organizacion-rangos|RangosService]] `reads` →
- [[service--personal-foja-servicio|FojaServicioService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
