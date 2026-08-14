---
id: screen--dashboard-guardias-ordenes
tipo: SCREEN
nombre: /dashboard/guardias/ordenes
nivel: L1
dominio: guardias
resumen: Pantalla /dashboard/guardias/ordenes.
ruta: /dashboard/guardias/ordenes
capa: frontend
permisos: [guardias:ordenes_crear, guardias:ordenes_configurar]
archivos:
  - frontend/src/app/dashboard/guardias/ordenes/page.tsx
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--front-api]
  - [uses, component--front-guardias]
terminos: [guardias, ordenes, crear, configurar]
---

# /dashboard/guardias/ordenes

Pantalla /dashboard/guardias/ordenes.

- **Ruta:** `/dashboard/guardias/ordenes`
- **Permisos referenciados:** `guardias:ordenes_crear`, `guardias:ordenes_configurar`

## Archivos

- `frontend/src/app/dashboard/guardias/ordenes/page.tsx`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-guardias|guardias]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
