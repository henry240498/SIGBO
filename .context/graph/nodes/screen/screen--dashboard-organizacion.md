---
id: screen--dashboard-organizacion
tipo: SCREEN
nombre: /dashboard/organizacion
nivel: L1
dominio: organizacion
resumen: Pantalla /dashboard/organizacion, consume 1 endpoint(s).
ruta: /dashboard/organizacion
capa: frontend
archivos:
  - frontend/src/app/dashboard/organizacion/page.tsx
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--front-api]
  - [uses, component--front-cargando]
  - [calls, api--organizacion-dashboard]
terminos: [organizacion]
---

# /dashboard/organizacion

Pantalla /dashboard/organizacion, consume 1 endpoint(s).

- **Ruta:** `/dashboard/organizacion`

## Endpoints que consume

- `/organizacion/dashboard`

## Archivos

- `frontend/src/app/dashboard/organizacion/page.tsx`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-cargando|Cargando]]
- `calls` → [[api--organizacion-dashboard|DashboardController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
