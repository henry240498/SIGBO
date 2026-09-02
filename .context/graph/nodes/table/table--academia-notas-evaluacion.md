---
id: table--academia-notas-evaluacion
tipo: TABLE
nombre: academia.notas_evaluacion
nivel: L2
dominio: academia
resumen: Tabla academia.notas_evaluacion (8 columnas). Creada en 036_academia_estructura.sql.
tabla: notas_evaluacion
archivos:
  - database/migrations/036_academia_estructura.sql
edges:
  - [defined_in, file--036-academia-estructura]
  - [belongs_to, domain--academia]
  - [references, table--academia-evaluaciones]
  - [references, table--academia-inscripciones]
  - [references, table--organizacion-parametros]
terminos: [academia, notas, evaluacion, inscripcion, calificacion, resultado, observaciones, creado, actualizado]
---

# academia.notas_evaluacion

Tabla academia.notas_evaluacion (8 columnas). Creada en 036_academia_estructura.sql.

- **Esquema:** academia · **Columnas:** 8
- **UNIQUE:** `evaluacion_id, inscripcion_id`

## Llaves foraneas

- `evaluacion_id` → [[table--academia-evaluaciones|academia.evaluaciones]]
- `inscripcion_id` → [[table--academia-inscripciones|academia.inscripciones]]
- `resultado_id` → [[table--organizacion-parametros|organizacion.parametros]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| evaluacion_id | UNIQUEIDENTIFIER |
| inscripcion_id | UNIQUEIDENTIFIER |
| calificacion | DECIMAL(5,2) |
| resultado_id | UNIQUEIDENTIFIER |
| observaciones | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |

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
- `references` → [[table--academia-evaluaciones|academia.evaluaciones]]
- `references` → [[table--academia-inscripciones|academia.inscripciones]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]

## Referenciado por

- [[entity--nota-evaluacion-academica|NotaEvaluacionAcademica]] `persisted_in` →
- [[service--academia-evaluaciones-academia|EvaluacionesAcademiaService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
