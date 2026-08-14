---
id: screen--dashboard-guardias-sorteos-id
tipo: SCREEN
nombre: "/dashboard/guardias/sorteos/[id]"
nivel: L1
dominio: guardias
resumen: "Pantalla /dashboard/guardias/sorteos/[id]."
ruta: /dashboard/guardias/sorteos/[id]
capa: frontend
permisos: [guardias:crear]
archivos:
  - frontend/src/app/dashboard/guardias/sorteos/[id]/page.tsx
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--front-api]
  - [uses, component--front-guardias]
terminos: [guardias, sorteos, crear]
---

# /dashboard/guardias/sorteos/[id]

Pantalla /dashboard/guardias/sorteos/[id].

- **Ruta:** `/dashboard/guardias/sorteos/[id]`
- **Permisos referenciados:** `guardias:crear`

## Archivos

- `frontend/src/app/dashboard/guardias/sorteos/[id]/page.tsx`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-guardias|guardias]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
