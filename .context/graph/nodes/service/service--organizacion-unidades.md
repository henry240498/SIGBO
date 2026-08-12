---
id: service--organizacion-unidades
tipo: SERVICE
nombre: UnidadesService
nivel: L2
dominio: organizacion
resumen: Logica de negocio de unidades (modulo organizacion).
capa: backend
archivos:
  - backend/src/modules/organizacion/unidades.service.ts
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--modulo-organizacion]
  - [uses, entity--unidad]
  - [reads, table--organizacion-unidades]
terminos: [unidades, organizacion, unidad]
---

# UnidadesService

Logica de negocio de unidades (modulo organizacion).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `darBaja()` · `reactivar()` · `filasExportables()`

## Archivos

- `backend/src/modules/organizacion/unidades.service.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--modulo-organizacion|organizacion (modulo NestJS)]]
- `uses` → [[entity--unidad|Unidad]]
- `reads` → [[table--organizacion-unidades|organizacion.unidades]]

## Referenciado por

- [[api--organizacion-unidades|UnidadesController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
