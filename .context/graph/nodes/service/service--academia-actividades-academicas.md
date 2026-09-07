---
id: service--academia-actividades-academicas
tipo: SERVICE
nombre: ActividadesAcademicasService
nivel: L2
dominio: academia
resumen: Logica de negocio de actividades academicas (modulo academia).
capa: backend
archivos:
  - backend/src/modules/academia/actividades-academicas.service.ts
edges:
  - [belongs_to, domain--academia]
  - [uses, component--modulo-academia]
  - [uses, entity--actividad-academica]
  - [reads, table--academia-actividades]
  - [uses, entity--instructor-actividad-academica]
  - [reads, table--academia-instructores-actividad]
  - [uses, entity--instructor-externo]
  - [reads, table--academia-instructores-externos]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--rango]
  - [reads, table--organizacion-rangos]
  - [uses, service--seguridad-auditoria]
terminos: [actividades, academicas, academia, actividad, academica, instructor, externo, bombero, rango]
---

# ActividadesAcademicasService

Logica de negocio de actividades academicas (modulo academia).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `listarInstructores()` · `asignarInstructor()` · `quitarInstructor()`

## Archivos

- `backend/src/modules/academia/actividades-academicas.service.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `uses` → [[component--modulo-academia|academia (modulo NestJS)]]
- `uses` → [[entity--actividad-academica|ActividadAcademica]]
- `reads` → [[table--academia-actividades|academia.actividades]]
- `uses` → [[entity--instructor-actividad-academica|InstructorActividadAcademica]]
- `reads` → [[table--academia-instructores-actividad|academia.instructores_actividad]]
- `uses` → [[entity--instructor-externo|InstructorExterno]]
- `reads` → [[table--academia-instructores-externos|academia.instructores_externos]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--rango|Rango]]
- `reads` → [[table--organizacion-rangos|organizacion.rangos]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[service--academia-reportes-academia|ReportesAcademiaService]] `uses` →
- [[api--academia-actividades-academicas|ActividadesAcademicasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
