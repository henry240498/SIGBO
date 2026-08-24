---
id: domain--academia
tipo: DOMAIN
nombre: Academia
nivel: L0
dominio: academia
estado: ACTIVO
resumen: "Modulo funcional \"Academia\". Habilitado en la navegacion."
archivos:
  - frontend/src/lib/modulos.ts
terminos: [academia]
---

# Academia

Modulo funcional "Academia". Habilitado en la navegacion.


## Archivos

- `frontend/src/lib/modulos.ts`

## Referenciado por

- [[entity--actividad-academica|ActividadAcademica]] `belongs_to` →
- [[entity--curso-externo-cache|CursoExternoCache]] `belongs_to` →
- [[entity--evaluacion-academica|EvaluacionAcademica]] `belongs_to` →
- [[entity--inscripcion-actividad-academica|InscripcionActividadAcademica]] `belongs_to` →
- [[entity--instructor-actividad-academica|InstructorActividadAcademica]] `belongs_to` →
- [[entity--instructor-externo|InstructorExterno]] `belongs_to` →
- [[entity--nota-evaluacion-academica|NotaEvaluacionAcademica]] `belongs_to` →
- [[table--academia-aspirantes|academia.aspirantes]] `belongs_to` →
- [[table--academia-instructores-externos|academia.instructores_externos]] `belongs_to` →
- [[table--academia-actividades|academia.actividades]] `belongs_to` →
- [[table--academia-instructores-actividad|academia.instructores_actividad]] `belongs_to` →
- [[table--academia-inscripciones|academia.inscripciones]] `belongs_to` →
- [[table--academia-evaluaciones|academia.evaluaciones]] `belongs_to` →
- [[table--academia-notas-evaluacion|academia.notas_evaluacion]] `belongs_to` →
- [[table--academia-cursos-externos-cache|academia.cursos_externos_cache]] `belongs_to` →
- [[component--modulo-academia|academia (modulo NestJS)]] `belongs_to` →
- [[service--academia-actividades-academicas|ActividadesAcademicasService]] `belongs_to` →
- [[service--academia-certificaciones-academia|CertificacionesAcademiaService]] `belongs_to` →
- [[service--academia-consultas-academia|ConsultasAcademiaService]] `belongs_to` →
- [[service--academia-cursos-externos|CursosExternosService]] `belongs_to` →
- [[service--academia-evaluaciones-academia|EvaluacionesAcademiaService]] `belongs_to` →
- [[service--academia-inscripciones-academia|InscripcionesAcademiaService]] `belongs_to` →
- [[service--academia-instructores-externos|InstructoresExternosService]] `belongs_to` →
- [[service--academia-reportes-academia|ReportesAcademiaService]] `belongs_to` →
- [[service--academia-sesiones-academia|SesionesAcademiaService]] `belongs_to` →
- [[api--academia-actividades-academicas|ActividadesAcademicasController]] `belongs_to` →
- [[api--academia-certificaciones-academia|CertificacionesAcademiaController]] `belongs_to` →
- [[api--academia-consultas-academia|ConsultasAcademiaController]] `belongs_to` →
- [[api--academia-cursos-externos|CursosExternosController]] `belongs_to` →
- [[api--academia-evaluaciones-academia|EvaluacionesAcademiaController]] `belongs_to` →
- [[api--academia-inscripciones-academia|InscripcionesAcademiaController]] `belongs_to` →
- [[api--academia-instructores-externos|InstructoresExternosController]] `belongs_to` →
- [[api--academia-reportes-academia|ReportesAcademiaController]] `belongs_to` →
- [[api--academia-sesiones-academia|SesionesAcademiaController]] `belongs_to` →
- [[screen--dashboard-academia-cursos-externos|/dashboard/academia/cursos-externos]] `belongs_to` →
- [[screen--dashboard-academia-instructores-externos|/dashboard/academia/instructores-externos]] `belongs_to` →
- [[screen--dashboard-academia|/dashboard/academia]] `belongs_to` →
- [[screen--dashboard-academia-id|/dashboard/academia/[id]]] `belongs_to` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
