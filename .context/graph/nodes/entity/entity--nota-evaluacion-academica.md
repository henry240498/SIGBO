---
id: entity--nota-evaluacion-academica
tipo: ENTITY
nombre: NotaEvaluacionAcademica
nivel: L1
dominio: academia
resumen: "Resultado de UN participante (via su inscripcion) en UNA evaluacion. Independiente del resultado final de la inscripcion (una actividad puede tener varias evaluaciones; el resultado final se fija aparte, en InscripcionActividadAcademica.resultadoFinalId)."
tabla: academia.notas_evaluacion
archivos:
  - backend/src/shared/entities/nota-evaluacion-academica.entity.ts
edges:
  - [belongs_to, domain--academia]
  - [persisted_in, table--academia-notas-evaluacion]
terminos: [nota, evaluacion, academica, notas, academia]
---

# NotaEvaluacionAcademica

Resultado de UN participante (via su inscripcion) en UNA evaluacion. Independiente del resultado final de la inscripcion (una actividad puede tener varias evaluaciones; el resultado final se fija aparte, en InscripcionActividadAcademica.resultadoFinalId).

- **Tabla:** [[table--academia-notas-evaluacion|academia.notas_evaluacion]]
- **Columnas mapeadas:** 5

## Donde se usa

- **Pantallas:** `/dashboard/academia`, `/dashboard/academia/[id]`, `/dashboard/academia/cursos-externos`, `/dashboard/academia/instructores-externos`, `/dashboard/finanzas/beneficios`, `/dashboard/personal/[id]`
- **Endpoints:** EvaluacionesAcademiaController
- **Servicios:** EvaluacionesAcademiaService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/nota-evaluacion-academica.entity.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `persisted_in` → [[table--academia-notas-evaluacion|academia.notas_evaluacion]]

## Referenciado por

- [[service--academia-evaluaciones-academia|EvaluacionesAcademiaService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
