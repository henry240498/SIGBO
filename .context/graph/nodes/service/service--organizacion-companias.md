---
id: service--organizacion-companias
tipo: SERVICE
nombre: CompaniasService
nivel: L2
dominio: organizacion
resumen: Logica de negocio de companias (modulo organizacion).
capa: backend
archivos:
  - backend/src/modules/organizacion/companias.service.ts
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--modulo-organizacion]
  - [uses, entity--compania]
  - [reads, table--organizacion-companias]
terminos: [companias, organizacion, compania]
---

# CompaniasService

Logica de negocio de companias (modulo organizacion).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `darBaja()` · `reactivar()` · `filasExportables()`

## Archivos

- `backend/src/modules/organizacion/companias.service.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--modulo-organizacion|organizacion (modulo NestJS)]]
- `uses` → [[entity--compania|Compania]]
- `reads` → [[table--organizacion-companias|organizacion.companias]]

## Referenciado por

- [[api--organizacion-companias|CompaniasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
