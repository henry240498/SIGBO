---
id: service--organizacion-ascensos
tipo: SERVICE
nombre: AscensosService
nivel: L2
dominio: organizacion
resumen: Logica de negocio de ascensos (modulo organizacion).
capa: backend
archivos:
  - backend/src/modules/organizacion/ascensos.service.ts
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--modulo-organizacion]
  - [uses, entity--ascenso]
  - [reads, table--organizacion-ascensos]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--rango]
  - [reads, table--organizacion-rangos]
terminos: [ascensos, organizacion, ascenso, bombero, rango]
---

# AscensosService

Logica de negocio de ascensos (modulo organizacion).


## Metodos

`findAll()` · `findOne()` · `create()` · `anular()` · `filasExportables()`

## Archivos

- `backend/src/modules/organizacion/ascensos.service.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--modulo-organizacion|organizacion (modulo NestJS)]]
- `uses` → [[entity--ascenso|Ascenso]]
- `reads` → [[table--organizacion-ascensos|organizacion.ascensos]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--rango|Rango]]
- `reads` → [[table--organizacion-rangos|organizacion.rangos]]

## Referenciado por

- [[api--organizacion-ascensos|AscensosController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
