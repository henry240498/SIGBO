---
id: screen--dashboard-guardias-grupos-id
tipo: SCREEN
nombre: "/dashboard/guardias/grupos/[id]"
nivel: L1
dominio: guardias
resumen: "Pantalla /dashboard/guardias/grupos/[id]."
ruta: /dashboard/guardias/grupos/[id]
capa: frontend
permisos: [guardias:editar]
archivos:
  - frontend/src/app/dashboard/guardias/grupos/[id]/page.tsx
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--front-api]
  - [uses, component--front-personal]
  - [uses, component--front-guardias]
terminos: [guardias, grupos, editar]
---

# /dashboard/guardias/grupos/[id]

Pantalla /dashboard/guardias/grupos/[id].

- **Ruta:** `/dashboard/guardias/grupos/[id]`
- **Permisos referenciados:** `guardias:editar`

## Archivos

- `frontend/src/app/dashboard/guardias/grupos/[id]/page.tsx`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-personal|personal]]
- `uses` → [[component--front-guardias|guardias]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
