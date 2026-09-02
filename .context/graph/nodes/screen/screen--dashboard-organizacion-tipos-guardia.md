---
id: screen--dashboard-organizacion-tipos-guardia
tipo: SCREEN
nombre: /dashboard/organizacion/tipos-guardia
nivel: L1
dominio: organizacion
resumen: Pantalla /dashboard/organizacion/tipos-guardia, consume 3 endpoint(s).
ruta: /dashboard/organizacion/tipos-guardia
capa: frontend
archivos:
  - frontend/src/app/dashboard/organizacion/tipos-guardia/page.tsx
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-api]
  - [uses, component--front-exportar]
  - [uses, component--front-aviso]
  - [calls, api--organizacion-tipos-guardia]
  - [calls, api--organizacion-tipos-guardia]
  - [calls, api--organizacion-tipos-guardia]
terminos: [organizacion, tipos, guardia]
---

# /dashboard/organizacion/tipos-guardia

Pantalla /dashboard/organizacion/tipos-guardia, consume 3 endpoint(s).

- **Ruta:** `/dashboard/organizacion/tipos-guardia`

## Endpoints que consume

- `/organizacion/tipos-guardia?`
- `/organizacion/tipos-guardia/`
- `/organizacion/tipos-guardia`

## Archivos

- `frontend/src/app/dashboard/organizacion/tipos-guardia/page.tsx`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-exportar|exportar]]
- `uses` → [[component--front-aviso|Aviso]]
- `calls` → [[api--organizacion-tipos-guardia|TiposGuardiaController]]
- `calls` → [[api--organizacion-tipos-guardia|TiposGuardiaController]]
- `calls` → [[api--organizacion-tipos-guardia|TiposGuardiaController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
