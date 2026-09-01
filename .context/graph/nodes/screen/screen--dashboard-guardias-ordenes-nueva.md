---
id: screen--dashboard-guardias-ordenes-nueva
tipo: SCREEN
nombre: /dashboard/guardias/ordenes/nueva
nivel: L1
dominio: guardias
resumen: Pantalla /dashboard/guardias/ordenes/nueva.
ruta: /dashboard/guardias/ordenes/nueva
capa: frontend
archivos:
  - frontend/src/app/dashboard/guardias/ordenes/nueva/page.tsx
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--front-guardias]
  - [uses, component--front-aviso]
terminos: [guardias, ordenes, nueva]
---

# /dashboard/guardias/ordenes/nueva

Pantalla /dashboard/guardias/ordenes/nueva.

- **Ruta:** `/dashboard/guardias/ordenes/nueva`

## Archivos

- `frontend/src/app/dashboard/guardias/ordenes/nueva/page.tsx`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--front-guardias|guardias]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
