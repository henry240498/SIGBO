---
id: table--personal-bombero-especialidades
tipo: TABLE
nombre: personal.bombero_especialidades
nivel: L2
dominio: personal
resumen: Tabla personal.bombero_especialidades (9 columnas). Creada en 012_organizacion.sql, modificada por 016_personal_expansion.sql.
tabla: bombero_especialidades
archivos:
  - database/migrations/012_organizacion.sql
  - database/migrations/016_personal_expansion.sql
edges:
  - [defined_in, file--012-organizacion]
  - [belongs_to, domain--personal]
  - [references, table--personal-bomberos]
  - [references, table--organizacion-especialidades]
terminos: [personal, bombero, especialidades, especialidad, fecha, obtencion, estado, creado, nivel, institucion, certificadora, vigencia]
---

# personal.bombero_especialidades

Tabla personal.bombero_especialidades (9 columnas). Creada en 012_organizacion.sql, modificada por 016_personal_expansion.sql.

- **Esquema:** personal · **Columnas:** 9
- **UNIQUE:** `bombero_id, especialidad_id`

## Llaves foraneas

- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]
- `especialidad_id` → [[table--organizacion-especialidades|organizacion.especialidades]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| especialidad_id | UNIQUEIDENTIFIER |
| fecha_obtencion | DATE |
| estado | NVARCHAR(20) |
| creado_en | DATETIMEOFFSET(3) |
| nivel | NVARCHAR(30) |
| institucion_certificadora | NVARCHAR(200) |
| vigencia | DATE |

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** EspecialidadesBomberoController, FojaServicioController
- **Servicios:** EspecialidadesBomberoService, FojaServicioService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/012_organizacion.sql`
- `database/migrations/016_personal_expansion.sql`

## Relaciones

- `defined_in` → [[file--012-organizacion|012_organizacion.sql]]
- `belongs_to` → [[domain--personal|Personal]]
- `references` → [[table--personal-bomberos|personal.bomberos]]
- `references` → [[table--organizacion-especialidades|organizacion.especialidades]]

## Referenciado por

- [[entity--bombero-especialidad|BomberoEspecialidad]] `persisted_in` →
- [[service--personal-especialidades-bombero|EspecialidadesBomberoService]] `reads` →
- [[service--personal-foja-servicio|FojaServicioService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
