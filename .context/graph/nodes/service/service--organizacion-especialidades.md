---
id: service--organizacion-especialidades
tipo: SERVICE
nombre: EspecialidadesService
nivel: L2
dominio: organizacion
resumen: Logica de negocio de especialidades (modulo organizacion).
capa: backend
archivos:
  - backend/src/modules/organizacion/especialidades.service.ts
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--modulo-organizacion]
  - [uses, entity--especialidad]
  - [reads, table--organizacion-especialidades]
terminos: [especialidades, organizacion, especialidad]
---

# EspecialidadesService

Logica de negocio de especialidades (modulo organizacion).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `darBaja()` · `reactivar()` · `filasExportables()`

## Archivos

- `backend/src/modules/organizacion/especialidades.service.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--modulo-organizacion|organizacion (modulo NestJS)]]
- `uses` → [[entity--especialidad|Especialidad]]
- `reads` → [[table--organizacion-especialidades|organizacion.especialidades]]

## Referenciado por

- [[api--organizacion-especialidades|EspecialidadesController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
