---
id: screen--dashboard-seguridad
tipo: SCREEN
nombre: /dashboard/seguridad
nivel: L1
dominio: seguridad
resumen: Pantalla /dashboard/seguridad, consume 1 endpoint(s).
ruta: /dashboard/seguridad
capa: frontend
archivos:
  - frontend/src/app/dashboard/seguridad/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-api]
  - [calls, api--seguridad-dashboard]
terminos: [seguridad]
---

# /dashboard/seguridad

Pantalla /dashboard/seguridad, consume 1 endpoint(s).

- **Ruta:** `/dashboard/seguridad`

## Endpoints que consume

- `/seguridad/dashboard`

## Archivos

- `frontend/src/app/dashboard/seguridad/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-api|api]]
- `calls` → [[api--seguridad-dashboard|DashboardController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
