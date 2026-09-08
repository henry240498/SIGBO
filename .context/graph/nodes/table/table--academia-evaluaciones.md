---
id: table--academia-evaluaciones
tipo: TABLE
nombre: academia.evaluaciones
nivel: L2
dominio: academia
resumen: Tabla academia.evaluaciones (10 columnas). Creada en 036_academia_estructura.sql.
tabla: evaluaciones
archivos:
  - database/migrations/036_academia_estructura.sql
edges:
  - [defined_in, file--036-academia-estructura]
  - [belongs_to, domain--academia]
  - [references, table--academia-actividades]
  - [references, table--organizacion-parametros]
  - [references, table--personal-bomberos]
  - [references, table--academia-instructores-externos]
terminos: [academia, evaluaciones, actividad, tipo, evaluacion, titulo, fecha, evaluador, bombero, externo, escala, observaciones, creado]
---

# academia.evaluaciones

Tabla academia.evaluaciones (10 columnas). Creada en 036_academia_estructura.sql.

- **Esquema:** academia · **Columnas:** 10

## Llaves foraneas

- `actividad_id` → [[table--academia-actividades|academia.actividades]]
- `tipo_evaluacion_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `evaluador_bombero_id` → [[table--personal-bomberos|personal.bomberos]]
- `evaluador_externo_id` → [[table--academia-instructores-externos|academia.instructores_externos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| actividad_id | UNIQUEIDENTIFIER |
| tipo_evaluacion_id | UNIQUEIDENTIFIER |
| titulo | NVARCHAR(200) |
| fecha | DATE |
| evaluador_bombero_id | UNIQUEIDENTIFIER |
| evaluador_externo_id | UNIQUEIDENTIFIER |
| escala | NVARCHAR(100) |
| observaciones | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** `/dashboard/academia`, `/dashboard/academia/[id]`, `/dashboard/academia/cursos-externos`, `/dashboard/academia/instructores-externos`, `/dashboard/finanzas/beneficios`
- **Endpoints:** EvaluacionesAcademiaController
- **Servicios:** EvaluacionesAcademiaService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/036_academia_estructura.sql`

## Relaciones

- `defined_in` → [[file--036-academia-estructura|036_academia_estructura.sql]]
- `belongs_to` → [[domain--academia|Academia]]
- `references` → [[table--academia-actividades|academia.actividades]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--personal-bomberos|personal.bomberos]]
- `references` → [[table--academia-instructores-externos|academia.instructores_externos]]

## Referenciado por

- [[table--academia-notas-evaluacion|academia.notas_evaluacion]] `references` →
- [[entity--evaluacion-academica|EvaluacionAcademica]] `persisted_in` →
- [[service--academia-evaluaciones-academia|EvaluacionesAcademiaService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
