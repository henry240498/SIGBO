---
id: screen--dashboard-organizacion-parametros
tipo: SCREEN
nombre: /dashboard/organizacion/parametros
nivel: L1
dominio: organizacion
resumen: Pantalla /dashboard/organizacion/parametros, consume 3 endpoint(s).
ruta: /dashboard/organizacion/parametros
capa: frontend
archivos:
  - frontend/src/app/dashboard/organizacion/parametros/page.tsx
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-api]
  - [uses, component--front-exportar]
  - [uses, component--front-parametros]
  - [uses, component--front-aviso]
  - [calls, api--organizacion-parametros]
  - [calls, api--organizacion-parametros]
  - [calls, api--organizacion-parametros]
terminos: [organizacion, parametros]
---

# /dashboard/organizacion/parametros

Pantalla /dashboard/organizacion/parametros, consume 3 endpoint(s).

- **Ruta:** `/dashboard/organizacion/parametros`

## Endpoints que consume

- `/organizacion/parametros?`
- `/organizacion/parametros/`
- `/organizacion/parametros`

## Archivos

- `frontend/src/app/dashboard/organizacion/parametros/page.tsx`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-exportar|exportar]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-aviso|Aviso]]
- `calls` → [[api--organizacion-parametros|ParametrosController]]
- `calls` → [[api--organizacion-parametros|ParametrosController]]
- `calls` → [[api--organizacion-parametros|ParametrosController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
