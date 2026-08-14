---
id: api--vehiculos-checklist-items
tipo: API
nombre: ChecklistItemsController
nivel: L2
dominio: vehiculos
resumen: Superficie HTTP de checklist items bajo /api/v1/vehiculos/checklist-items.
prefijo: /api/v1/vehiculos/checklist-items
capa: backend
permisos: [vehiculos:ver, vehiculos:editar]
archivos:
  - backend/src/modules/vehiculos/checklist-items.controller.ts
edges:
  - [belongs_to, domain--vehiculos]
  - [exposes, service--vehiculos-checklist-items]
terminos: [checklist, items, vehiculos, ver, editar]
---

# ChecklistItemsController

Superficie HTTP de checklist items bajo /api/v1/vehiculos/checklist-items.

- **Prefijo:** `/api/v1/vehiculos/checklist-items`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/vehiculos/checklist-items` | `vehiculos:ver` |
| POST | `/vehiculos/checklist-items` | `vehiculos:editar` |
| PATCH | `/vehiculos/checklist-items/:id` | `vehiculos:editar` |
| DELETE | `/vehiculos/checklist-items/:id` | `vehiculos:editar` |

## Archivos

- `backend/src/modules/vehiculos/checklist-items.controller.ts`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `exposes` → [[service--vehiculos-checklist-items|ChecklistItemsService]]

## Referenciado por

- [[component--front-vehiculos|vehiculos]] `calls` →
- [[component--front-vehiculos|vehiculos]] `calls` →
- [[component--front-vehiculos|vehiculos]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
