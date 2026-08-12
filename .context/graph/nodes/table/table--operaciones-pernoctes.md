---
id: table--operaciones-pernoctes
tipo: TABLE
nombre: operaciones.pernoctes
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.pernoctes (10 columnas). Creada en 025_guardias.sql.
tabla: pernoctes
archivos:
  - database/migrations/025_guardias.sql
edges:
  - [defined_in, file--025-guardias]
  - [belongs_to, domain--asistencia]
  - [references, table--operaciones-guardias]
  - [references, table--personal-bomberos]
terminos: [operaciones, pernoctes, guardia, fecha, bombero, hora, entrada, salida, motivo, observacion, creado]
---

# operaciones.pernoctes

Tabla operaciones.pernoctes (10 columnas). Creada en 025_guardias.sql.

- **Esquema:** operaciones · **Columnas:** 10

## Llaves foraneas

- `guardia_id` → [[table--operaciones-guardias|operaciones.guardias]]
- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| guardia_id | UNIQUEIDENTIFIER |
| fecha | DATE |
| bombero_id | UNIQUEIDENTIFIER |
| hora_entrada | DATETIMEOFFSET(3) |
| hora_salida | DATETIMEOFFSET(3) |
| motivo | NVARCHAR(MAX) |
| observacion | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Archivos

- `database/migrations/025_guardias.sql`

## Relaciones

- `defined_in` → [[file--025-guardias|025_guardias.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]
- `references` → [[table--operaciones-guardias|operaciones.guardias]]
- `references` → [[table--personal-bomberos|personal.bomberos]]

## Referenciado por

- [[entity--pernocte|Pernocte]] `persisted_in` →
- [[service--guardias-pernoctes|PernoctesService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
