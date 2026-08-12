---
id: service--organizacion-parametros
tipo: SERVICE
nombre: ParametrosService
nivel: L2
dominio: organizacion
resumen: Logica de negocio de parametros (modulo organizacion).
capa: backend
archivos:
  - backend/src/modules/organizacion/parametros.service.ts
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--modulo-organizacion]
  - [uses, entity--parametro]
  - [reads, table--organizacion-parametros]
terminos: [parametros, organizacion, parametro]
---

# ParametrosService

Logica de negocio de parametros (modulo organizacion).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `darBaja()` · `reactivar()` · `filasExportables()`

## Archivos

- `backend/src/modules/organizacion/parametros.service.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--modulo-organizacion|organizacion (modulo NestJS)]]
- `uses` → [[entity--parametro|Parametro]]
- `reads` → [[table--organizacion-parametros|organizacion.parametros]]

## Referenciado por

- [[api--organizacion-parametros|ParametrosController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
