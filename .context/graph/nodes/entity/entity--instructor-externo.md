---
id: entity--instructor-externo
tipo: ENTITY
nombre: InstructorExterno
nivel: L1
dominio: academia
resumen: Instructor que no pertenece a la institucion (distinto de un bombero instructor, que se referencia directamente desde personal.bomberos).
tabla: academia.instructores_externos
archivos:
  - backend/src/shared/entities/instructor-externo.entity.ts
edges:
  - [belongs_to, domain--academia]
  - [persisted_in, table--academia-instructores-externos]
terminos: [instructor, externo, instructores, externos, academia]
---

# InstructorExterno

Instructor que no pertenece a la institucion (distinto de un bombero instructor, que se referencia directamente desde personal.bomberos).

- **Tabla:** [[table--academia-instructores-externos|academia.instructores_externos]]
- **Columnas mapeadas:** 9

## Donde se usa

- **Pantallas:** `/dashboard/academia`, `/dashboard/academia/[id]`, `/dashboard/academia/cursos-externos`, `/dashboard/academia/instructores-externos`, `/dashboard/finanzas/beneficios`, `/dashboard/personal/[id]`
- **Endpoints:** ActividadesAcademicasController, EvaluacionesAcademiaController, InstructoresExternosController
- **Servicios:** ActividadesAcademicasService, EvaluacionesAcademiaService, InstructoresExternosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/instructor-externo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `persisted_in` → [[table--academia-instructores-externos|academia.instructores_externos]]

## Referenciado por

- [[service--academia-actividades-academicas|ActividadesAcademicasService]] `uses` →
- [[service--academia-evaluaciones-academia|EvaluacionesAcademiaService]] `uses` →
- [[service--academia-instructores-externos|InstructoresExternosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
