---
id: service--personal-foja-servicio
tipo: SERVICE
nombre: FojaServicioService
nivel: L2
dominio: personal
resumen: Logica de negocio de foja servicio (modulo personal).
capa: backend
archivos:
  - backend/src/modules/personal/foja-servicio.service.ts
edges:
  - [belongs_to, domain--personal]
  - [uses, component--modulo-personal]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--rango]
  - [reads, table--organizacion-rangos]
  - [uses, entity--cargo]
  - [reads, table--organizacion-cargos]
  - [uses, entity--compania]
  - [reads, table--organizacion-companias]
  - [uses, entity--bombero-especialidad]
  - [reads, table--personal-bombero-especialidades]
  - [uses, entity--especialidad]
  - [reads, table--organizacion-especialidades]
  - [uses, entity--certificacion]
  - [reads, table--personal-certificaciones]
  - [uses, entity--actividad-profesional]
  - [reads, table--personal-actividad-profesional]
  - [uses, entity--idioma-bombero]
  - [reads, table--personal-idiomas-bombero]
  - [uses, entity--historial-institucional]
  - [reads, table--personal-historial-institucional]
  - [uses, entity--designacion]
  - [reads, table--organizacion-designaciones]
  - [uses, entity--foja-servicio]
  - [reads, table--personal-fojas-servicio]
  - [uses, entity--parametro]
  - [reads, table--organizacion-parametros]
  - [uses, entity--inscripcion-actividad-academica]
  - [reads, table--academia-inscripciones]
  - [uses, entity--actividad-academica]
  - [reads, table--academia-actividades]
terminos: [foja, servicio, personal, bombero, rango, cargo, compania, especialidad, certificacion, actividad, profesional, idioma, historial, institucional, designacion, parametro, inscripcion, academica]
---

# FojaServicioService

Logica de negocio de foja servicio (modulo personal).


## Metodos

`generar()` · `listarAnios()` · `obtenerPorAnio()` · `descargarArchivo()`

## Archivos

- `backend/src/modules/personal/foja-servicio.service.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `uses` → [[component--modulo-personal|personal (modulo NestJS)]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--rango|Rango]]
- `reads` → [[table--organizacion-rangos|organizacion.rangos]]
- `uses` → [[entity--cargo|Cargo]]
- `reads` → [[table--organizacion-cargos|organizacion.cargos]]
- `uses` → [[entity--compania|Compania]]
- `reads` → [[table--organizacion-companias|organizacion.companias]]
- `uses` → [[entity--bombero-especialidad|BomberoEspecialidad]]
- `reads` → [[table--personal-bombero-especialidades|personal.bombero_especialidades]]
- `uses` → [[entity--especialidad|Especialidad]]
- `reads` → [[table--organizacion-especialidades|organizacion.especialidades]]
- `uses` → [[entity--certificacion|Certificacion]]
- `reads` → [[table--personal-certificaciones|personal.certificaciones]]
- `uses` → [[entity--actividad-profesional|ActividadProfesional]]
- `reads` → [[table--personal-actividad-profesional|personal.actividad_profesional]]
- `uses` → [[entity--idioma-bombero|IdiomaBombero]]
- `reads` → [[table--personal-idiomas-bombero|personal.idiomas_bombero]]
- `uses` → [[entity--historial-institucional|HistorialInstitucional]]
- `reads` → [[table--personal-historial-institucional|personal.historial_institucional]]
- `uses` → [[entity--designacion|Designacion]]
- `reads` → [[table--organizacion-designaciones|organizacion.designaciones]]
- `uses` → [[entity--foja-servicio|FojaServicio]]
- `reads` → [[table--personal-fojas-servicio|personal.fojas_servicio]]
- `uses` → [[entity--parametro|Parametro]]
- `reads` → [[table--organizacion-parametros|organizacion.parametros]]
- `uses` → [[entity--inscripcion-actividad-academica|InscripcionActividadAcademica]]
- `reads` → [[table--academia-inscripciones|academia.inscripciones]]
- `uses` → [[entity--actividad-academica|ActividadAcademica]]
- `reads` → [[table--academia-actividades|academia.actividades]]

## Referenciado por

- [[api--personal-foja-servicio|FojaServicioController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
