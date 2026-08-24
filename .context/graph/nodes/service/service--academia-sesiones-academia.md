---
id: service--academia-sesiones-academia
tipo: SERVICE
nombre: SesionesAcademiaService
nivel: L2
dominio: academia
resumen: Logica de negocio de sesiones academia (modulo academia).
capa: backend
archivos:
  - backend/src/modules/academia/sesiones-academia.service.ts
edges:
  - [belongs_to, domain--academia]
  - [uses, component--modulo-academia]
  - [uses, entity--actividad-academica]
  - [reads, table--academia-actividades]
  - [uses, entity--evento-asistencia]
  - [reads, table--operaciones-eventos-asistencia]
  - [uses, entity--inscripcion-actividad-academica]
  - [reads, table--academia-inscripciones]
  - [uses, service--operaciones-eventos-asistencia]
  - [uses, service--seguridad-auditoria]
terminos: [sesiones, academia, actividad, academica, evento, asistencia, inscripcion]
---

# SesionesAcademiaService

Logica de negocio de sesiones academia (modulo academia).


## Metodos

`listarSesiones()` · `crearSesion()`

## Archivos

- `backend/src/modules/academia/sesiones-academia.service.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `uses` → [[component--modulo-academia|academia (modulo NestJS)]]
- `uses` → [[entity--actividad-academica|ActividadAcademica]]
- `reads` → [[table--academia-actividades|academia.actividades]]
- `uses` → [[entity--evento-asistencia|EventoAsistencia]]
- `reads` → [[table--operaciones-eventos-asistencia|operaciones.eventos_asistencia]]
- `uses` → [[entity--inscripcion-actividad-academica|InscripcionActividadAcademica]]
- `reads` → [[table--academia-inscripciones|academia.inscripciones]]
- `uses` → [[service--operaciones-eventos-asistencia|EventosAsistenciaService]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--academia-sesiones-academia|SesionesAcademiaController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
