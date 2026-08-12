---
id: screen--dashboard-vehiculos-checklist-items
tipo: SCREEN
nombre: /dashboard/vehiculos/checklist-items
nivel: L1
dominio: vehiculos
resumen: Pantalla /dashboard/vehiculos/checklist-items.
ruta: /dashboard/vehiculos/checklist-items
capa: frontend
permisos: [vehiculos:editar]
archivos:
  - frontend/src/app/dashboard/vehiculos/checklist-items/page.tsx
edges:
  - [belongs_to, domain--vehiculos]
  - [uses, component--front-api]
  - [uses, component--front-vehiculos]
terminos: [vehiculos, checklist, items, editar]
---

# /dashboard/vehiculos/checklist-items

Pantalla /dashboard/vehiculos/checklist-items.

- **Ruta:** `/dashboard/vehiculos/checklist-items`
- **Permisos referenciados:** `vehiculos:editar`

## Archivos

- `frontend/src/app/dashboard/vehiculos/checklist-items/page.tsx`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-vehiculos|vehiculos]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
