---
id: screen--dashboard-guardias-id
tipo: SCREEN
nombre: "/dashboard/guardias/[id]"
nivel: L1
dominio: guardias
resumen: "Pantalla /dashboard/guardias/[id]."
ruta: /dashboard/guardias/[id]
capa: frontend
permisos: [guardias:editar, guardias:eliminar, guardias:asignar, guardias:reemplazar]
archivos:
  - frontend/src/app/dashboard/guardias/[id]/page.tsx
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--front-api]
  - [uses, component--front-personal]
  - [uses, component--front-parametros]
  - [uses, component--front-guardias]
terminos: [guardias, editar, eliminar, asignar, reemplazar]
---

# /dashboard/guardias/[id]

Pantalla /dashboard/guardias/[id].

- **Ruta:** `/dashboard/guardias/[id]`
- **Permisos referenciados:** `guardias:editar`, `guardias:eliminar`, `guardias:asignar`, `guardias:reemplazar`

## Archivos

- `frontend/src/app/dashboard/guardias/[id]/page.tsx`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-personal|personal]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-guardias|guardias]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
