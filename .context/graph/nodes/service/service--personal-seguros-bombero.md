---
id: service--personal-seguros-bombero
tipo: SERVICE
nombre: SegurosBomberoService
nivel: L2
dominio: personal
resumen: Logica de negocio de seguros bombero (modulo personal).
capa: backend
archivos:
  - backend/src/modules/personal/seguros-bombero.service.ts
edges:
  - [belongs_to, domain--personal]
  - [uses, component--modulo-personal]
  - [uses, entity--seguro-bombero]
  - [reads, table--personal-seguros-bombero]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
terminos: [seguros, bombero, personal, seguro]
---

# SegurosBomberoService

Logica de negocio de seguros bombero (modulo personal).


## Metodos

`listar()` · `findOne()` · `crear()` · `actualizar()` · `darBaja()`

## Archivos

- `backend/src/modules/personal/seguros-bombero.service.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `uses` → [[component--modulo-personal|personal (modulo NestJS)]]
- `uses` → [[entity--seguro-bombero|SeguroBombero]]
- `reads` → [[table--personal-seguros-bombero|personal.seguros_bombero]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]

## Referenciado por

- [[api--personal-seguros-bombero|SegurosBomberoController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
