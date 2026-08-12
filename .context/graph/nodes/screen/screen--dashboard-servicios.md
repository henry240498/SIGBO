---
id: screen--dashboard-servicios
tipo: SCREEN
nombre: /dashboard/servicios
nivel: L1
dominio: servicios
resumen: Pantalla /dashboard/servicios, consume 1 endpoint(s).
ruta: /dashboard/servicios
capa: frontend
archivos:
  - frontend/src/app/dashboard/servicios/page.tsx
edges:
  - [belongs_to, domain--servicios]
  - [uses, component--front-api]
  - [uses, component--front-systemicon]
  - [calls, api--servicios-servicios]
terminos: [servicios]
---

# /dashboard/servicios

Pantalla /dashboard/servicios, consume 1 endpoint(s).

- **Ruta:** `/dashboard/servicios`

## Endpoints que consume

- `/servicios/comunicaciones`

## Archivos

- `frontend/src/app/dashboard/servicios/page.tsx`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-systemicon|SystemIcon]]
- `calls` → [[api--servicios-servicios|ServiciosController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
