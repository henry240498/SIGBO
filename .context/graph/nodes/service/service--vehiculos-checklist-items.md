---
id: service--vehiculos-checklist-items
tipo: SERVICE
nombre: ChecklistItemsService
nivel: L2
dominio: vehiculos
resumen: Logica de negocio de checklist items (modulo vehiculos).
capa: backend
archivos:
  - backend/src/modules/vehiculos/checklist-items.service.ts
edges:
  - [belongs_to, domain--vehiculos]
  - [uses, component--modulo-vehiculos]
  - [uses, entity--checklist-item-vehiculo]
  - [reads, table--vehiculos-checklist-items]
terminos: [checklist, items, vehiculos, item, vehiculo]
---

# ChecklistItemsService

Logica de negocio de checklist items (modulo vehiculos).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `remove()`

## Archivos

- `backend/src/modules/vehiculos/checklist-items.service.ts`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `uses` → [[component--modulo-vehiculos|vehiculos (modulo NestJS)]]
- `uses` → [[entity--checklist-item-vehiculo|ChecklistItemVehiculo]]
- `reads` → [[table--vehiculos-checklist-items|vehiculos.checklist_items]]

## Referenciado por

- [[api--vehiculos-checklist-items|ChecklistItemsController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
