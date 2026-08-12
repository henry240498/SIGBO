---
id: screen--dashboard-guardias
tipo: SCREEN
nombre: /dashboard/guardias
nivel: L1
dominio: guardias
resumen: Pantalla /dashboard/guardias.
ruta: /dashboard/guardias
capa: frontend
permisos: [guardias:crear]
archivos:
  - frontend/src/app/dashboard/guardias/page.tsx
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--front-api]
  - [uses, component--front-guardias]
terminos: [guardias, crear]
---

# /dashboard/guardias

Pantalla /dashboard/guardias.

- **Ruta:** `/dashboard/guardias`
- **Permisos referenciados:** `guardias:crear`

## Archivos

- `frontend/src/app/dashboard/guardias/page.tsx`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-guardias|guardias]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
