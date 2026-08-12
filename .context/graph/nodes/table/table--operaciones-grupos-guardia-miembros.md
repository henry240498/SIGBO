---
id: table--operaciones-grupos-guardia-miembros
tipo: TABLE
nombre: operaciones.grupos_guardia_miembros
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.grupos_guardia_miembros (6 columnas). Creada en 025_guardias.sql.
tabla: grupos_guardia_miembros
archivos:
  - database/migrations/025_guardias.sql
edges:
  - [defined_in, file--025-guardias]
  - [belongs_to, domain--asistencia]
  - [references, table--operaciones-grupos-guardia]
  - [references, table--personal-bomberos]
terminos: [operaciones, grupos, guardia, miembros, grupo, bombero, rol, orden, creado]
---

# operaciones.grupos_guardia_miembros

Tabla operaciones.grupos_guardia_miembros (6 columnas). Creada en 025_guardias.sql.

- **Esquema:** operaciones · **Columnas:** 6
- **UNIQUE:** `grupo_id, bombero_id`

## Llaves foraneas

- `grupo_id` → [[table--operaciones-grupos-guardia|operaciones.grupos_guardia]]
- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| grupo_id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| rol | NVARCHAR(20) |
| orden | INT |
| creado_en | DATETIMEOFFSET(3) |

## Archivos

- `database/migrations/025_guardias.sql`

## Relaciones

- `defined_in` → [[file--025-guardias|025_guardias.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]
- `references` → [[table--operaciones-grupos-guardia|operaciones.grupos_guardia]]
- `references` → [[table--personal-bomberos|personal.bomberos]]

## Referenciado por

- [[entity--grupo-guardia-miembro|GrupoGuardiaMiembro]] `persisted_in` →
- [[service--guardias-grupos-guardia|GruposGuardiaService]] `reads` →
- [[service--guardias-guardias|GuardiasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
