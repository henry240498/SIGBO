---
id: service--academia-inscripciones-academia
tipo: SERVICE
nombre: InscripcionesAcademiaService
nivel: L2
dominio: academia
resumen: Logica de negocio de inscripciones academia (modulo academia).
capa: backend
archivos:
  - backend/src/modules/academia/inscripciones-academia.service.ts
edges:
  - [belongs_to, domain--academia]
  - [uses, component--modulo-academia]
  - [uses, entity--actividad-academica]
  - [reads, table--academia-actividades]
  - [uses, entity--inscripcion-actividad-academica]
  - [reads, table--academia-inscripciones]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--rango]
  - [reads, table--organizacion-rangos]
  - [uses, entity--participante-externo]
  - [reads, table--operaciones-participantes-externos]
  - [uses, entity--parametro]
  - [reads, table--organizacion-parametros]
  - [uses, entity--historial-institucional]
  - [reads, table--personal-historial-institucional]
  - [uses, entity--socio-protector]
  - [reads, table--finanzas-socios-protectores]
  - [uses, service--seguridad-auditoria]
  - [uses, service--finanzas-beneficios-socios]
terminos: [inscripciones, academia, actividad, academica, inscripcion, bombero, rango, participante, externo, parametro, historial, institucional, socio, protector]
---

# InscripcionesAcademiaService

Logica de negocio de inscripciones academia (modulo academia).


## Metodos

`listarParticipantes()` · `inscribir()` · `actualizar()` · `quitar()`

## Archivos

- `backend/src/modules/academia/inscripciones-academia.service.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `uses` → [[component--modulo-academia|academia (modulo NestJS)]]
- `uses` → [[entity--actividad-academica|ActividadAcademica]]
- `reads` → [[table--academia-actividades|academia.actividades]]
- `uses` → [[entity--inscripcion-actividad-academica|InscripcionActividadAcademica]]
- `reads` → [[table--academia-inscripciones|academia.inscripciones]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--rango|Rango]]
- `reads` → [[table--organizacion-rangos|organizacion.rangos]]
- `uses` → [[entity--participante-externo|ParticipanteExterno]]
- `reads` → [[table--operaciones-participantes-externos|operaciones.participantes_externos]]
- `uses` → [[entity--parametro|Parametro]]
- `reads` → [[table--organizacion-parametros|organizacion.parametros]]
- `uses` → [[entity--historial-institucional|HistorialInstitucional]]
- `reads` → [[table--personal-historial-institucional|personal.historial_institucional]]
- `uses` → [[entity--socio-protector|SocioProtector]]
- `reads` → [[table--finanzas-socios-protectores|finanzas.socios_protectores]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]
- `uses` → [[service--finanzas-beneficios-socios|BeneficiosSociosService]]

## Referenciado por

- [[service--academia-reportes-academia|ReportesAcademiaService]] `uses` →
- [[api--academia-inscripciones-academia|InscripcionesAcademiaController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
