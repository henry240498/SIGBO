---
id: screen--dashboard-organizacion-rangos
tipo: SCREEN
nombre: /dashboard/organizacion/rangos
nivel: L1
dominio: organizacion
resumen: Pantalla /dashboard/organizacion/rangos, consume 3 endpoint(s).
ruta: /dashboard/organizacion/rangos
capa: frontend
archivos:
  - frontend/src/app/dashboard/organizacion/rangos/page.tsx
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-api]
  - [uses, component--front-exportar]
  - [calls, api--organizacion-rangos]
  - [calls, api--organizacion-rangos]
  - [calls, api--organizacion-rangos]
terminos: [organizacion, rangos]
---

# /dashboard/organizacion/rangos

Pantalla /dashboard/organizacion/rangos, consume 3 endpoint(s).

- **Ruta:** `/dashboard/organizacion/rangos`

## Endpoints que consume

- `/organizacion/rangos?`
- `/organizacion/rangos/`
- `/organizacion/rangos`

## Archivos

- `frontend/src/app/dashboard/organizacion/rangos/page.tsx`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-exportar|exportar]]
- `calls` → [[api--organizacion-rangos|RangosController]]
- `calls` → [[api--organizacion-rangos|RangosController]]
- `calls` → [[api--organizacion-rangos|RangosController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
