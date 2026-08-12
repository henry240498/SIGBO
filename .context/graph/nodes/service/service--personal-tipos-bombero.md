---
id: service--personal-tipos-bombero
tipo: SERVICE
nombre: TiposBomberoService
nivel: L2
dominio: personal
resumen: Logica de negocio de tipos bombero (modulo personal).
capa: backend
archivos:
  - backend/src/modules/personal/tipos-bombero.service.ts
edges:
  - [belongs_to, domain--personal]
  - [uses, component--modulo-personal]
  - [uses, entity--tipo-bombero]
  - [reads, table--personal-tipos-bombero]
terminos: [tipos, bombero, personal, tipo]
---

# TiposBomberoService

Logica de negocio de tipos bombero (modulo personal).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `darBaja()` · `reactivar()` · `filasExportables()`

## Archivos

- `backend/src/modules/personal/tipos-bombero.service.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `uses` → [[component--modulo-personal|personal (modulo NestJS)]]
- `uses` → [[entity--tipo-bombero|TipoBombero]]
- `reads` → [[table--personal-tipos-bombero|personal.tipos_bombero]]

## Referenciado por

- [[api--personal-tipos-bombero|TiposBomberoController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
