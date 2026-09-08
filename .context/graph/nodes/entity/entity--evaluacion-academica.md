---
id: entity--evaluacion-academica
tipo: ENTITY
nombre: EvaluacionAcademica
nivel: L1
dominio: academia
resumen: "Una instancia de evaluacion dentro de una actividad academica (ej. \"Examen teorico del 15/03\"). El tipo (teorico/practico/fisico/etc.) es parametrizable via organizacion.parametros (tipo TIPO_EVALUACION_ACADEMICA)."
tabla: academia.evaluaciones
archivos:
  - backend/src/shared/entities/evaluacion-academica.entity.ts
edges:
  - [belongs_to, domain--academia]
  - [persisted_in, table--academia-evaluaciones]
terminos: [evaluacion, academica, evaluaciones, academia]
---

# EvaluacionAcademica

Una instancia de evaluacion dentro de una actividad academica (ej. "Examen teorico del 15/03"). El tipo (teorico/practico/fisico/etc.) es parametrizable via organizacion.parametros (tipo TIPO_EVALUACION_ACADEMICA).

- **Tabla:** [[table--academia-evaluaciones|academia.evaluaciones]]
- **Columnas mapeadas:** 8

## Donde se usa

- **Pantallas:** `/dashboard/academia`, `/dashboard/academia/[id]`, `/dashboard/academia/cursos-externos`, `/dashboard/academia/instructores-externos`, `/dashboard/finanzas/beneficios`
- **Endpoints:** EvaluacionesAcademiaController
- **Servicios:** EvaluacionesAcademiaService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/evaluacion-academica.entity.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `persisted_in` → [[table--academia-evaluaciones|academia.evaluaciones]]

## Referenciado por

- [[service--academia-evaluaciones-academia|EvaluacionesAcademiaService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
