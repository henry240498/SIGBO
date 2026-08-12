---
id: screen--dashboard-organizacion-guardias
tipo: SCREEN
nombre: /dashboard/organizacion/guardias
nivel: L1
dominio: organizacion
resumen: Pantalla /dashboard/organizacion/guardias, consume 3 endpoint(s).
ruta: /dashboard/organizacion/guardias
capa: frontend
archivos:
  - frontend/src/app/dashboard/organizacion/guardias/page.tsx
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--front-api]
  - [uses, component--front-exportar]
  - [calls, api--organizacion-tipos-guardia]
  - [calls, api--organizacion-tipos-guardia]
  - [calls, api--organizacion-tipos-guardia]
terminos: [organizacion, guardias]
---

# /dashboard/organizacion/guardias

Pantalla /dashboard/organizacion/guardias, consume 3 endpoint(s).

- **Ruta:** `/dashboard/organizacion/guardias`

## Endpoints que consume

- `/organizacion/tipos-guardia?`
- `/organizacion/tipos-guardia/`
- `/organizacion/tipos-guardia`

## Archivos

- `frontend/src/app/dashboard/organizacion/guardias/page.tsx`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-exportar|exportar]]
- `calls` → [[api--organizacion-tipos-guardia|TiposGuardiaController]]
- `calls` → [[api--organizacion-tipos-guardia|TiposGuardiaController]]
- `calls` → [[api--organizacion-tipos-guardia|TiposGuardiaController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
