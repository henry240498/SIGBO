---
id: screen--dashboard-organizacion-cargos
tipo: SCREEN
nombre: /dashboard/organizacion/cargos
nivel: L1
dominio: organizacion
resumen: Pantalla /dashboard/organizacion/cargos, consume 3 endpoint(s).
ruta: /dashboard/organizacion/cargos
capa: frontend
archivos:
  - frontend/src/app/dashboard/organizacion/cargos/page.tsx
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--front-api]
  - [uses, component--front-exportar]
  - [calls, api--organizacion-cargos]
  - [calls, api--organizacion-cargos]
  - [calls, api--organizacion-cargos]
terminos: [organizacion, cargos]
---

# /dashboard/organizacion/cargos

Pantalla /dashboard/organizacion/cargos, consume 3 endpoint(s).

- **Ruta:** `/dashboard/organizacion/cargos`

## Endpoints que consume

- `/organizacion/cargos?`
- `/organizacion/cargos/`
- `/organizacion/cargos`

## Archivos

- `frontend/src/app/dashboard/organizacion/cargos/page.tsx`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-exportar|exportar]]
- `calls` → [[api--organizacion-cargos|CargosController]]
- `calls` → [[api--organizacion-cargos|CargosController]]
- `calls` → [[api--organizacion-cargos|CargosController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
