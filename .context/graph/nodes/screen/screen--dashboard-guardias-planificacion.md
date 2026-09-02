---
id: screen--dashboard-guardias-planificacion
tipo: SCREEN
nombre: /dashboard/guardias/planificacion
nivel: L1
dominio: guardias
resumen: Pantalla /dashboard/guardias/planificacion.
ruta: /dashboard/guardias/planificacion
capa: frontend
archivos:
  - frontend/src/app/dashboard/guardias/planificacion/page.tsx
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-guardias]
  - [uses, component--front-aviso]
terminos: [guardias, planificacion]
---

# /dashboard/guardias/planificacion

Pantalla /dashboard/guardias/planificacion.

- **Ruta:** `/dashboard/guardias/planificacion`

## Archivos

- `frontend/src/app/dashboard/guardias/planificacion/page.tsx`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-guardias|guardias]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
