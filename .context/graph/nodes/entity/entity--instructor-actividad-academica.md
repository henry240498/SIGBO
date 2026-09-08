---
id: entity--instructor-actividad-academica
tipo: ENTITY
nombre: InstructorActividadAcademica
nivel: L1
dominio: academia
resumen: Instructor de una actividad academica -- bombero (referenciado desde Personal) O instructor externo (nunca ambos, nunca ninguno).
tabla: academia.instructores_actividad
archivos:
  - backend/src/shared/entities/instructor-actividad-academica.entity.ts
edges:
  - [belongs_to, domain--academia]
  - [persisted_in, table--academia-instructores-actividad]
terminos: [instructor, actividad, academica, instructores, academia, rol, principal, ayudante]
---

# InstructorActividadAcademica

Instructor de una actividad academica -- bombero (referenciado desde Personal) O instructor externo (nunca ambos, nunca ninguno).

- **Tabla:** [[table--academia-instructores-actividad|academia.instructores_actividad]]
- **Columnas mapeadas:** 4

## Estados y enumeraciones

- `RolInstructorActividad`: `PRINCIPAL` · `AYUDANTE`

## Donde se usa

- **Pantallas:** `/dashboard/academia`, `/dashboard/academia/[id]`, `/dashboard/academia/cursos-externos`, `/dashboard/academia/instructores-externos`, `/dashboard/finanzas/beneficios`
- **Endpoints:** ActividadesAcademicasController
- **Servicios:** ActividadesAcademicasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/instructor-actividad-academica.entity.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `persisted_in` → [[table--academia-instructores-actividad|academia.instructores_actividad]]

## Referenciado por

- [[service--academia-actividades-academicas|ActividadesAcademicasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
