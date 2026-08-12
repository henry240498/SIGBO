---
id: screen--dashboard-guardias-pernoctes
tipo: SCREEN
nombre: /dashboard/guardias/pernoctes
nivel: L1
dominio: guardias
resumen: Pantalla /dashboard/guardias/pernoctes.
ruta: /dashboard/guardias/pernoctes
capa: frontend
permisos: [guardias:editar]
archivos:
  - frontend/src/app/dashboard/guardias/pernoctes/page.tsx
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--front-api]
  - [uses, component--front-personal]
  - [uses, component--front-guardias]
terminos: [guardias, pernoctes, editar]
---

# /dashboard/guardias/pernoctes

Pantalla /dashboard/guardias/pernoctes.

- **Ruta:** `/dashboard/guardias/pernoctes`
- **Permisos referenciados:** `guardias:editar`

## Archivos

- `frontend/src/app/dashboard/guardias/pernoctes/page.tsx`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-personal|personal]]
- `uses` → [[component--front-guardias|guardias]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
