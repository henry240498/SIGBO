---
id: table--operaciones-inspecciones-estacion
tipo: TABLE
nombre: operaciones.inspecciones_estacion
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.inspecciones_estacion (7 columnas). Creada en 025_guardias.sql.
tabla: inspecciones_estacion
archivos:
  - database/migrations/025_guardias.sql
edges:
  - [defined_in, file--025-guardias]
  - [belongs_to, domain--asistencia]
  - [references, table--operaciones-guardias]
  - [references, table--organizacion-parametros]
  - [references, table--personal-bomberos]
terminos: [operaciones, inspecciones, estacion, guardia, sector, estado, observacion, responsable, creado]
---

# operaciones.inspecciones_estacion

Tabla operaciones.inspecciones_estacion (7 columnas). Creada en 025_guardias.sql.

- **Esquema:** operaciones · **Columnas:** 7

## Llaves foraneas

- `guardia_id` → [[table--operaciones-guardias|operaciones.guardias]]
- `sector` → [[table--organizacion-parametros|organizacion.parametros]]
- `responsable_id` → [[table--personal-bomberos|personal.bomberos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| guardia_id | UNIQUEIDENTIFIER |
| sector | UNIQUEIDENTIFIER |
| estado | NVARCHAR(10) |
| observacion | NVARCHAR(MAX) |
| responsable_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |

## Archivos

- `database/migrations/025_guardias.sql`

## Relaciones

- `defined_in` → [[file--025-guardias|025_guardias.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]
- `references` → [[table--operaciones-guardias|operaciones.guardias]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--personal-bomberos|personal.bomberos]]

## Referenciado por

- [[entity--inspeccion-estacion|InspeccionEstacion]] `persisted_in` →
- [[service--guardias-inspecciones-estacion|InspeccionesEstacionService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
