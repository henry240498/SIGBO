---
id: service--organizacion-cargos
tipo: SERVICE
nombre: CargosService
nivel: L2
dominio: organizacion
resumen: Logica de negocio de cargos (modulo organizacion).
capa: backend
archivos:
  - backend/src/modules/organizacion/cargos.service.ts
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--modulo-organizacion]
  - [uses, entity--cargo]
  - [reads, table--organizacion-cargos]
terminos: [cargos, organizacion, cargo]
---

# CargosService

Logica de negocio de cargos (modulo organizacion).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `darBaja()` · `reactivar()` · `filasExportables()`

## Archivos

- `backend/src/modules/organizacion/cargos.service.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--modulo-organizacion|organizacion (modulo NestJS)]]
- `uses` → [[entity--cargo|Cargo]]
- `reads` → [[table--organizacion-cargos|organizacion.cargos]]

## Referenciado por

- [[api--organizacion-cargos|CargosController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
