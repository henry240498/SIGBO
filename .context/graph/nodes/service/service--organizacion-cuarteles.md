---
id: service--organizacion-cuarteles
tipo: SERVICE
nombre: CuartelsService
nivel: L2
dominio: organizacion
resumen: Logica de negocio de cuarteles (modulo organizacion).
capa: backend
archivos:
  - backend/src/modules/organizacion/cuarteles.service.ts
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--modulo-organizacion]
  - [uses, entity--cuartel]
  - [reads, table--organizacion-cuarteles]
terminos: [cuartels, organizacion, cuarteles, cuartel]
---

# CuartelsService

Logica de negocio de cuarteles (modulo organizacion).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `darBaja()` · `reactivar()` · `filasExportables()`

## Archivos

- `backend/src/modules/organizacion/cuarteles.service.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--modulo-organizacion|organizacion (modulo NestJS)]]
- `uses` → [[entity--cuartel|Cuartel]]
- `reads` → [[table--organizacion-cuarteles|organizacion.cuarteles]]

## Referenciado por

- [[api--organizacion-cuarteles|CuartelsController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
