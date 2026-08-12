---
id: screen--dashboard-organizacion-tipos-bombero
tipo: SCREEN
nombre: /dashboard/organizacion/tipos-bombero
nivel: L1
dominio: organizacion
resumen: Pantalla /dashboard/organizacion/tipos-bombero, consume 3 endpoint(s).
ruta: /dashboard/organizacion/tipos-bombero
capa: frontend
archivos:
  - frontend/src/app/dashboard/organizacion/tipos-bombero/page.tsx
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--front-api]
  - [uses, component--front-exportar]
  - [calls, api--personal-tipos-bombero]
  - [calls, api--personal-tipos-bombero]
  - [calls, api--personal-tipos-bombero]
terminos: [organizacion, tipos, bombero]
---

# /dashboard/organizacion/tipos-bombero

Pantalla /dashboard/organizacion/tipos-bombero, consume 3 endpoint(s).

- **Ruta:** `/dashboard/organizacion/tipos-bombero`

## Endpoints que consume

- `/personal/tipos-bombero?`
- `/personal/tipos-bombero/`
- `/personal/tipos-bombero`

## Archivos

- `frontend/src/app/dashboard/organizacion/tipos-bombero/page.tsx`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-exportar|exportar]]
- `calls` → [[api--personal-tipos-bombero|TiposBomberoController]]
- `calls` → [[api--personal-tipos-bombero|TiposBomberoController]]
- `calls` → [[api--personal-tipos-bombero|TiposBomberoController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
