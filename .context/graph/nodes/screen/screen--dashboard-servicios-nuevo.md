---
id: screen--dashboard-servicios-nuevo
tipo: SCREEN
nombre: /dashboard/servicios/nuevo
nivel: L1
dominio: servicios
resumen: Pantalla /dashboard/servicios/nuevo, consume 2 endpoint(s).
ruta: /dashboard/servicios/nuevo
capa: frontend
archivos:
  - frontend/src/app/dashboard/servicios/nuevo/page.tsx
edges:
  - [belongs_to, domain--servicios]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-api]
  - [uses, component--front-vehiculos]
  - [calls, api--servicios-servicios]
  - [calls, api--servicios-servicios]
terminos: [servicios, nuevo]
---

# /dashboard/servicios/nuevo

Pantalla /dashboard/servicios/nuevo, consume 2 endpoint(s).

- **Ruta:** `/dashboard/servicios/nuevo`

## Endpoints que consume

- `/servicios/comunicaciones/`
- `/servicios/comunicaciones/catalogos`

## Archivos

- `frontend/src/app/dashboard/servicios/nuevo/page.tsx`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-vehiculos|vehiculos]]
- `calls` → [[api--servicios-servicios|ServiciosController]]
- `calls` → [[api--servicios-servicios|ServiciosController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
