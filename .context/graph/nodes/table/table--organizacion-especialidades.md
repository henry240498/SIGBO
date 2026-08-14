---
id: table--organizacion-especialidades
tipo: TABLE
nombre: organizacion.especialidades
nivel: L2
dominio: organizacion
resumen: Tabla organizacion.especialidades (11 columnas). Creada en 012_organizacion.sql, modificada por 012_organizacion.sql.
tabla: especialidades
archivos:
  - database/migrations/012_organizacion.sql
edges:
  - [defined_in, file--012-organizacion]
  - [belongs_to, domain--organizacion]
terminos: [organizacion, especialidades, codigo, nombre, descripcion, requisitos, estado, creado, actualizado, eliminado]
---

# organizacion.especialidades

Tabla organizacion.especialidades (11 columnas). Creada en 012_organizacion.sql, modificada por 012_organizacion.sql.

- **Esquema:** organizacion · **Columnas:** 11
- **UNIQUE:** `codigo`, `nombre`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(20) |
| nombre | NVARCHAR(100) |
| descripcion | NVARCHAR(MAX) |
| requisitos | NVARCHAR(MAX) |
| estado | NVARCHAR(20) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| eliminado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/organizacion/especialidades`
- **Endpoints:** EspecialidadesBomberoController, EspecialidadesController, FojaServicioController
- **Servicios:** DashboardService, EspecialidadesBomberoService, EspecialidadesService, FojaServicioService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/012_organizacion.sql`

## Relaciones

- `defined_in` → [[file--012-organizacion|012_organizacion.sql]]
- `belongs_to` → [[domain--organizacion|Organización Institucional]]

## Referenciado por

- [[table--personal-bombero-especialidades|personal.bombero_especialidades]] `references` →
- [[entity--especialidad|Especialidad]] `persisted_in` →
- [[service--organizacion-dashboard|DashboardService]] `reads` →
- [[service--organizacion-especialidades|EspecialidadesService]] `reads` →
- [[service--personal-especialidades-bombero|EspecialidadesBomberoService]] `reads` →
- [[service--personal-foja-servicio|FojaServicioService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
