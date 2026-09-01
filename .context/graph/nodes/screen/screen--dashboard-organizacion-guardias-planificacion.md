---
id: screen--dashboard-organizacion-guardias-planificacion
tipo: SCREEN
nombre: /dashboard/organizacion/guardias/planificacion
nivel: L1
dominio: organizacion
resumen: Pantalla /dashboard/organizacion/guardias/planificacion.
ruta: /dashboard/organizacion/guardias/planificacion
capa: frontend
archivos:
  - frontend/src/app/dashboard/organizacion/guardias/planificacion/page.tsx
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-guardias]
  - [uses, component--front-aviso]
terminos: [organizacion, guardias, planificacion]
---

# /dashboard/organizacion/guardias/planificacion

Pantalla /dashboard/organizacion/guardias/planificacion.

- **Ruta:** `/dashboard/organizacion/guardias/planificacion`

## Archivos

- `frontend/src/app/dashboard/organizacion/guardias/planificacion/page.tsx`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-guardias|guardias]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
