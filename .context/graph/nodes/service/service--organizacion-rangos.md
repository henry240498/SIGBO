---
id: service--organizacion-rangos
tipo: SERVICE
nombre: RangosService
nivel: L2
dominio: organizacion
resumen: Logica de negocio de rangos (modulo organizacion).
capa: backend
archivos:
  - backend/src/modules/organizacion/rangos.service.ts
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--modulo-organizacion]
  - [uses, entity--rango]
  - [reads, table--organizacion-rangos]
terminos: [rangos, organizacion, rango]
---

# RangosService

Logica de negocio de rangos (modulo organizacion).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `darBaja()` · `reactivar()` · `filasExportables()`

## Archivos

- `backend/src/modules/organizacion/rangos.service.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--modulo-organizacion|organizacion (modulo NestJS)]]
- `uses` → [[entity--rango|Rango]]
- `reads` → [[table--organizacion-rangos|organizacion.rangos]]

## Referenciado por

- [[api--organizacion-rangos|RangosController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
