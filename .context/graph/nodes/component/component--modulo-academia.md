---
id: component--modulo-academia
tipo: COMPONENT
nombre: academia (modulo NestJS)
nivel: L1
dominio: academia
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de academia.
capa: backend
archivos:
  - backend/src/modules/academia/academia.module.ts
edges:
  - [belongs_to, domain--academia]
terminos: [academia, modulo]
---

# academia (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de academia.


## Entidades registradas (forFeature)

ActividadAcademica, InstructorActividadAcademica, InstructorExterno, InscripcionActividadAcademica, EvaluacionAcademica, NotaEvaluacionAcademica, // Entidades de otros modulos que Academia consulta directamente
      // (mismo patron de bajo acoplamiento ya usado en GuardiasModule):
      // nunca se duplican sus estructuras.
      Bombero, Rango, Cargo, Designacion, Parametro, ParticipanteExterno, EventoAsistencia, Certificacion, Usuario, HistorialInstitucional, CursoExternoCache, IdentidadInstitucional, SocioProtector

## Archivos

- `backend/src/modules/academia/academia.module.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]

## Referenciado por

- [[service--academia-actividades-academicas|ActividadesAcademicasService]] `uses` →
- [[service--academia-certificaciones-academia|CertificacionesAcademiaService]] `uses` →
- [[service--academia-consultas-academia|ConsultasAcademiaService]] `uses` →
- [[service--academia-cursos-externos|CursosExternosService]] `uses` →
- [[service--academia-evaluaciones-academia|EvaluacionesAcademiaService]] `uses` →
- [[service--academia-inscripciones-academia|InscripcionesAcademiaService]] `uses` →
- [[service--academia-instructores-externos|InstructoresExternosService]] `uses` →
- [[service--academia-reportes-academia|ReportesAcademiaService]] `uses` →
- [[service--academia-sesiones-academia|SesionesAcademiaService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
