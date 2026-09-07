---
id: screen--dashboard-guardias-generar
tipo: SCREEN
nombre: /dashboard/guardias/generar
nivel: L1
dominio: guardias
resumen: Pantalla /dashboard/guardias/generar.
ruta: /dashboard/guardias/generar
capa: frontend
permisos: [guardias:crear, guardias:ordenes_crear, guardias:ordenes_editar]
archivos:
  - frontend/src/app/dashboard/guardias/generar/page.tsx
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--front-api]
  - [uses, component--front-guardias]
terminos: [guardias, generar, crear, ordenes, editar]
---

# /dashboard/guardias/generar

Pantalla /dashboard/guardias/generar.

- **Ruta:** `/dashboard/guardias/generar`
- **Permisos referenciados:** `guardias:crear`, `guardias:ordenes_crear`, `guardias:ordenes_editar`

## Archivos

- `frontend/src/app/dashboard/guardias/generar/page.tsx`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-guardias|guardias]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
