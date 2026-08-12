---
id: table--operaciones-grupos-guardia
tipo: TABLE
nombre: operaciones.grupos_guardia
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.grupos_guardia (8 columnas). Creada en 025_guardias.sql.
tabla: grupos_guardia
archivos:
  - database/migrations/025_guardias.sql
edges:
  - [defined_in, file--025-guardias]
  - [belongs_to, domain--asistencia]
  - [references, table--personal-bomberos]
terminos: [operaciones, grupos, guardia, nombre, oficial, cargo, estado, observaciones, creado, actualizado]
---

# operaciones.grupos_guardia

Tabla operaciones.grupos_guardia (8 columnas). Creada en 025_guardias.sql.

- **Esquema:** operaciones · **Columnas:** 8

## Llaves foraneas

- `oficial_a_cargo_id` → [[table--personal-bomberos|personal.bomberos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| nombre | NVARCHAR(150) |
| oficial_a_cargo_id | UNIQUEIDENTIFIER |
| estado | NVARCHAR(20) |
| observaciones | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Archivos

- `database/migrations/025_guardias.sql`

## Relaciones

- `defined_in` → [[file--025-guardias|025_guardias.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]
- `references` → [[table--personal-bomberos|personal.bomberos]]

## Referenciado por

- [[table--operaciones-grupos-guardia-miembros|operaciones.grupos_guardia_miembros]] `references` →
- [[entity--grupo-guardia|GrupoGuardia]] `persisted_in` →
- [[service--guardias-grupos-guardia|GruposGuardiaService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
