---
id: table--operaciones-requisitos-rol-guardia
tipo: TABLE
nombre: operaciones.requisitos_rol_guardia
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.requisitos_rol_guardia (7 columnas). Creada en 025_guardias.sql.
tabla: requisitos_rol_guardia
archivos:
  - database/migrations/025_guardias.sql
edges:
  - [defined_in, file--025-guardias]
  - [belongs_to, domain--asistencia]
  - [references, table--organizacion-cargos]
  - [references, table--organizacion-rangos]
  - [references, table--personal-tipos-bombero]
terminos: [operaciones, requisitos, rol, guardia, cargo, requerido, rango, tipo, bombero, activo, creado]
---

# operaciones.requisitos_rol_guardia

Tabla operaciones.requisitos_rol_guardia (7 columnas). Creada en 025_guardias.sql.

- **Esquema:** operaciones · **Columnas:** 7

## Llaves foraneas

- `cargo_id_requerido` → [[table--organizacion-cargos|organizacion.cargos]]
- `rango_id_requerido` → [[table--organizacion-rangos|organizacion.rangos]]
- `tipo_bombero_id_requerido` → [[table--personal-tipos-bombero|personal.tipos_bombero]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| rol | NVARCHAR(30) |
| cargo_id_requerido | UNIQUEIDENTIFIER |
| rango_id_requerido | UNIQUEIDENTIFIER |
| tipo_bombero_id_requerido | UNIQUEIDENTIFIER |
| activo | BIT |
| creado_en | DATETIMEOFFSET(3) |

## Archivos

- `database/migrations/025_guardias.sql`

## Relaciones

- `defined_in` → [[file--025-guardias|025_guardias.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]
- `references` → [[table--organizacion-cargos|organizacion.cargos]]
- `references` → [[table--organizacion-rangos|organizacion.rangos]]
- `references` → [[table--personal-tipos-bombero|personal.tipos_bombero]]

## Referenciado por

- [[entity--requisito-rol-guardia|RequisitoRolGuardia]] `persisted_in` →
- [[service--guardias-elegibilidad|ElegibilidadService]] `reads` →
- [[service--guardias-requisitos-rol|RequisitosRolService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
