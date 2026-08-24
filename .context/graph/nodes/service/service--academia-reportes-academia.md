---
id: service--academia-reportes-academia
tipo: SERVICE
nombre: ReportesAcademiaService
nivel: L2
dominio: academia
resumen: Logica de negocio de reportes academia (modulo academia).
capa: backend
archivos:
  - backend/src/modules/academia/reportes-academia.service.ts
edges:
  - [belongs_to, domain--academia]
  - [uses, component--modulo-academia]
  - [uses, entity--actividad-academica]
  - [reads, table--academia-actividades]
  - [uses, entity--parametro]
  - [reads, table--organizacion-parametros]
  - [uses, entity--identidad-institucional]
  - [reads, table--organizacion-identidad-institucional]
  - [uses, entity--cargo]
  - [reads, table--organizacion-cargos]
  - [uses, entity--designacion]
  - [reads, table--organizacion-designaciones]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--rango]
  - [reads, table--organizacion-rangos]
  - [uses, service--academia-actividades-academicas]
  - [uses, service--academia-inscripciones-academia]
terminos: [reportes, academia, actividad, academica, parametro, identidad, institucional, cargo, designacion, bombero, rango]
---

# ReportesAcademiaService

Logica de negocio de reportes academia (modulo academia).


## Metodos

`generarPdf()` · `generarDocx()`

## Archivos

- `backend/src/modules/academia/reportes-academia.service.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `uses` → [[component--modulo-academia|academia (modulo NestJS)]]
- `uses` → [[entity--actividad-academica|ActividadAcademica]]
- `reads` → [[table--academia-actividades|academia.actividades]]
- `uses` → [[entity--parametro|Parametro]]
- `reads` → [[table--organizacion-parametros|organizacion.parametros]]
- `uses` → [[entity--identidad-institucional|IdentidadInstitucional]]
- `reads` → [[table--organizacion-identidad-institucional|organizacion.identidad_institucional]]
- `uses` → [[entity--cargo|Cargo]]
- `reads` → [[table--organizacion-cargos|organizacion.cargos]]
- `uses` → [[entity--designacion|Designacion]]
- `reads` → [[table--organizacion-designaciones|organizacion.designaciones]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--rango|Rango]]
- `reads` → [[table--organizacion-rangos|organizacion.rangos]]
- `uses` → [[service--academia-actividades-academicas|ActividadesAcademicasService]]
- `uses` → [[service--academia-inscripciones-academia|InscripcionesAcademiaService]]

## Referenciado por

- [[api--academia-reportes-academia|ReportesAcademiaController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
