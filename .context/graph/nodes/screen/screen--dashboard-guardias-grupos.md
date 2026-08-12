---
id: screen--dashboard-guardias-grupos
tipo: SCREEN
nombre: /dashboard/guardias/grupos
nivel: L1
dominio: guardias
resumen: Pantalla /dashboard/guardias/grupos.
ruta: /dashboard/guardias/grupos
capa: frontend
permisos: [guardias:crear]
archivos:
  - frontend/src/app/dashboard/guardias/grupos/page.tsx
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--front-api]
  - [uses, component--front-personal]
  - [uses, component--front-guardias]
terminos: [guardias, grupos, crear]
---

# /dashboard/guardias/grupos

Pantalla /dashboard/guardias/grupos.

- **Ruta:** `/dashboard/guardias/grupos`
- **Permisos referenciados:** `guardias:crear`

## Archivos

- `frontend/src/app/dashboard/guardias/grupos/page.tsx`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-personal|personal]]
- `uses` → [[component--front-guardias|guardias]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
