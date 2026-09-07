---
id: component--front-academia
tipo: COMPONENT
nombre: academia
nivel: L2
dominio: academia
resumen: "Helper de frontend \"academia\" (48 exportaciones, consume 10 endpoint(s))."
capa: frontend
archivos:
  - frontend/src/lib/academia.ts
edges:
  - [calls, api--academia-actividades-academicas]
  - [calls, api--academia-actividades-academicas]
  - [calls, api--academia-actividades-academicas]
  - [calls, api--academia-evaluaciones-academia]
  - [calls, api--equipos-equipamiento-bombero]
  - [calls, api--academia-evaluaciones-academia]
  - [calls, api--academia-instructores-externos]
  - [calls, api--academia-instructores-externos]
  - [calls, api--academia-cursos-externos]
  - [calls, api--academia-cursos-externos]
terminos: [academia, estado, actividad, academica, instructor, externo, input, inscripcion, participante, evaluacion, nota, cargar, tipos, modalidades, academicas, resultados, academicos, actividades, crear, actualizar, instructores, asignar, bombero]
---

# academia

Helper de frontend "academia" (48 exportaciones, consume 10 endpoint(s)).


## Archivos

- `frontend/src/lib/academia.ts`

## Relaciones

- `calls` → [[api--academia-actividades-academicas|ActividadesAcademicasController]]
- `calls` → [[api--academia-actividades-academicas|ActividadesAcademicasController]]
- `calls` → [[api--academia-actividades-academicas|ActividadesAcademicasController]]
- `calls` → [[api--academia-evaluaciones-academia|EvaluacionesAcademiaController]]
- `calls` → [[api--equipos-equipamiento-bombero|EquipamientoBomberoController]]
- `calls` → [[api--academia-evaluaciones-academia|EvaluacionesAcademiaController]]
- `calls` → [[api--academia-instructores-externos|InstructoresExternosController]]
- `calls` → [[api--academia-instructores-externos|InstructoresExternosController]]
- `calls` → [[api--academia-cursos-externos|CursosExternosController]]
- `calls` → [[api--academia-cursos-externos|CursosExternosController]]

## Referenciado por

- [[screen--dashboard-academia-cursos-externos|/dashboard/academia/cursos-externos]] `uses` →
- [[screen--dashboard-academia-instructores-externos|/dashboard/academia/instructores-externos]] `uses` →
- [[screen--dashboard-academia|/dashboard/academia]] `uses` →
- [[screen--dashboard-academia-id|/dashboard/academia/[id]]] `uses` →
- [[screen--dashboard-finanzas-beneficios|/dashboard/finanzas/beneficios]] `uses` →
- [[screen--dashboard-personal-id|/dashboard/personal/[id]]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
