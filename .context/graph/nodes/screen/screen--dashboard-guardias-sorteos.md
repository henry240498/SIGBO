---
id: screen--dashboard-guardias-sorteos
tipo: SCREEN
nombre: /dashboard/guardias/sorteos
nivel: L1
dominio: guardias
resumen: Pantalla /dashboard/guardias/sorteos.
ruta: /dashboard/guardias/sorteos
capa: frontend
permisos: [guardias:sorteos]
archivos:
  - frontend/src/app/dashboard/guardias/sorteos/page.tsx
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--front-api]
  - [uses, component--front-guardias]
  - [uses, component--front-aviso]
terminos: [guardias, sorteos]
---

# /dashboard/guardias/sorteos

Pantalla /dashboard/guardias/sorteos.

- **Ruta:** `/dashboard/guardias/sorteos`
- **Permisos referenciados:** `guardias:sorteos`

## Archivos

- `frontend/src/app/dashboard/guardias/sorteos/page.tsx`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-guardias|guardias]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
