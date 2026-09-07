---
id: service--personal-consultas-cruzadas
tipo: SERVICE
nombre: ConsultasCruzadasService
nivel: L2
dominio: personal
resumen: Logica de negocio de consultas cruzadas (modulo personal).
capa: backend
archivos:
  - backend/src/modules/personal/consultas-cruzadas.service.ts
edges:
  - [belongs_to, domain--personal]
  - [uses, component--modulo-personal]
  - [uses, entity--guardia]
  - [reads, table--operaciones-guardias]
  - [uses, entity--asignacion-guardia]
  - [reads, table--operaciones-asignacion-guardias]
  - [uses, entity--tipo-servicio]
  - [reads, table--servicios-tipos-servicio]
  - [uses, entity--servicio]
  - [reads, table--servicios-servicios]
  - [uses, entity--personal-servicio]
  - [reads, table--servicios-personal-servicio]
  - [uses, entity--actividad-academica]
  - [reads, table--academia-actividades]
  - [uses, entity--inscripcion-actividad-academica]
  - [reads, table--academia-inscripciones]
  - [uses, entity--parametro]
  - [reads, table--organizacion-parametros]
terminos: [consultas, cruzadas, personal, guardia, asignacion, tipo, servicio, actividad, academica, inscripcion, parametro]
---

# ConsultasCruzadasService

Logica de negocio de consultas cruzadas (modulo personal).


## Metodos

`guardiasDeBombero()` · `serviciosDeBombero()` · `formacionAcademicaDeBombero()` · `if()` · `if()` · `if()`

## Archivos

- `backend/src/modules/personal/consultas-cruzadas.service.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `uses` → [[component--modulo-personal|personal (modulo NestJS)]]
- `uses` → [[entity--guardia|Guardia]]
- `reads` → [[table--operaciones-guardias|operaciones.guardias]]
- `uses` → [[entity--asignacion-guardia|AsignacionGuardia]]
- `reads` → [[table--operaciones-asignacion-guardias|operaciones.asignacion_guardias]]
- `uses` → [[entity--tipo-servicio|TipoServicio]]
- `reads` → [[table--servicios-tipos-servicio|servicios.tipos_servicio]]
- `uses` → [[entity--servicio|Servicio]]
- `reads` → [[table--servicios-servicios|servicios.servicios]]
- `uses` → [[entity--personal-servicio|PersonalServicio]]
- `reads` → [[table--servicios-personal-servicio|servicios.personal_servicio]]
- `uses` → [[entity--actividad-academica|ActividadAcademica]]
- `reads` → [[table--academia-actividades|academia.actividades]]
- `uses` → [[entity--inscripcion-actividad-academica|InscripcionActividadAcademica]]
- `reads` → [[table--academia-inscripciones|academia.inscripciones]]
- `uses` → [[entity--parametro|Parametro]]
- `reads` → [[table--organizacion-parametros|organizacion.parametros]]

## Referenciado por

- [[api--personal-consultas-cruzadas|ConsultasCruzadasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
