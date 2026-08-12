---
id: table--personal-tipos-bombero
tipo: TABLE
nombre: personal.tipos_bombero
nivel: L2
dominio: personal
resumen: Tabla personal.tipos_bombero (11 columnas). Creada en 017_tipos_bombero.sql.
tabla: tipos_bombero
archivos:
  - database/migrations/017_tipos_bombero.sql
edges:
  - [defined_in, file--017-tipos-bombero]
  - [belongs_to, domain--personal]
terminos: [personal, tipos, bombero, nombre, prefijo, descripcion, orden, estado, creado, actualizado, eliminado]
---

# personal.tipos_bombero

Tabla personal.tipos_bombero (11 columnas). Creada en 017_tipos_bombero.sql.

- **Esquema:** personal · **Columnas:** 11
- **UNIQUE:** `nombre`, `prefijo`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| nombre | NVARCHAR(150) |
| prefijo | NVARCHAR(10) |
| descripcion | NVARCHAR(MAX) |
| orden | INT |
| estado | NVARCHAR(20) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| eliminado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |

## Archivos

- `database/migrations/017_tipos_bombero.sql`

## Relaciones

- `defined_in` → [[file--017-tipos-bombero|017_tipos_bombero.sql]]
- `belongs_to` → [[domain--personal|Personal]]

## Referenciado por

- [[table--operaciones-requisitos-rol-guardia|operaciones.requisitos_rol_guardia]] `references` →
- [[entity--tipo-bombero|TipoBombero]] `persisted_in` →
- [[service--personal-tipos-bombero|TiposBomberoService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
