---
id: table--personal-actividad-profesional
tipo: TABLE
nombre: personal.actividad_profesional
nivel: L2
dominio: personal
resumen: Tabla personal.actividad_profesional (8 columnas). Creada en 016_personal_expansion.sql, modificada por 018_parametros_y_normalizacion_personal.sql.
tabla: actividad_profesional
archivos:
  - database/migrations/016_personal_expansion.sql
  - database/migrations/018_parametros_y_normalizacion_personal.sql
edges:
  - [defined_in, file--016-personal-expansion]
  - [belongs_to, domain--personal]
  - [references, table--personal-bomberos]
terminos: [personal, actividad, profesional, bombero, empresa, cargo, laboral, experiencia, actividades, relacionadas, actualizado, profesion]
---

# personal.actividad_profesional

Tabla personal.actividad_profesional (8 columnas). Creada en 016_personal_expansion.sql, modificada por 018_parametros_y_normalizacion_personal.sql.

- **Esquema:** personal · **Columnas:** 8
- **UNIQUE:** `bombero_id`

## Llaves foraneas

- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| empresa | NVARCHAR(150) |
| cargo_laboral | NVARCHAR(150) |
| experiencia | NVARCHAR(MAX) |
| actividades_relacionadas | NVARCHAR(MAX) |
| actualizado_en | DATETIMEOFFSET(3) |
| profesion_id | UNIQUEIDENTIFIER |

## Archivos

- `database/migrations/016_personal_expansion.sql`
- `database/migrations/018_parametros_y_normalizacion_personal.sql`

## Relaciones

- `defined_in` → [[file--016-personal-expansion|016_personal_expansion.sql]]
- `belongs_to` → [[domain--personal|Personal]]
- `references` → [[table--personal-bomberos|personal.bomberos]]

## Referenciado por

- [[entity--actividad-profesional|ActividadProfesional]] `persisted_in` →
- [[service--personal-actividad-profesional|ActividadProfesionalService]] `reads` →
- [[service--personal-foja-servicio|FojaServicioService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
