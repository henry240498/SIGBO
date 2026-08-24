---
id: service--academia-evaluaciones-academia
tipo: SERVICE
nombre: EvaluacionesAcademiaService
nivel: L2
dominio: academia
resumen: Logica de negocio de evaluaciones academia (modulo academia).
capa: backend
archivos:
  - backend/src/modules/academia/evaluaciones-academia.service.ts
edges:
  - [belongs_to, domain--academia]
  - [uses, component--modulo-academia]
  - [uses, entity--actividad-academica]
  - [reads, table--academia-actividades]
  - [uses, entity--evaluacion-academica]
  - [reads, table--academia-evaluaciones]
  - [uses, entity--nota-evaluacion-academica]
  - [reads, table--academia-notas-evaluacion]
  - [uses, entity--inscripcion-actividad-academica]
  - [reads, table--academia-inscripciones]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--instructor-externo]
  - [reads, table--academia-instructores-externos]
  - [uses, entity--participante-externo]
  - [reads, table--operaciones-participantes-externos]
  - [uses, entity--parametro]
  - [reads, table--organizacion-parametros]
  - [uses, service--seguridad-auditoria]
terminos: [evaluaciones, academia, actividad, academica, evaluacion, nota, inscripcion, bombero, instructor, externo, participante, parametro]
---

# EvaluacionesAcademiaService

Logica de negocio de evaluaciones academia (modulo academia).


## Metodos

`listarEvaluaciones()` · `crearEvaluacion()` · `listarNotas()` · `registrarNota()`

## Archivos

- `backend/src/modules/academia/evaluaciones-academia.service.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `uses` → [[component--modulo-academia|academia (modulo NestJS)]]
- `uses` → [[entity--actividad-academica|ActividadAcademica]]
- `reads` → [[table--academia-actividades|academia.actividades]]
- `uses` → [[entity--evaluacion-academica|EvaluacionAcademica]]
- `reads` → [[table--academia-evaluaciones|academia.evaluaciones]]
- `uses` → [[entity--nota-evaluacion-academica|NotaEvaluacionAcademica]]
- `reads` → [[table--academia-notas-evaluacion|academia.notas_evaluacion]]
- `uses` → [[entity--inscripcion-actividad-academica|InscripcionActividadAcademica]]
- `reads` → [[table--academia-inscripciones|academia.inscripciones]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--instructor-externo|InstructorExterno]]
- `reads` → [[table--academia-instructores-externos|academia.instructores_externos]]
- `uses` → [[entity--participante-externo|ParticipanteExterno]]
- `reads` → [[table--operaciones-participantes-externos|operaciones.participantes_externos]]
- `uses` → [[entity--parametro|Parametro]]
- `reads` → [[table--organizacion-parametros|organizacion.parametros]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--academia-evaluaciones-academia|EvaluacionesAcademiaController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
