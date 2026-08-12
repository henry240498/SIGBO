---
id: screen--dashboard-organizacion-companias
tipo: SCREEN
nombre: /dashboard/organizacion/companias
nivel: L1
dominio: organizacion
resumen: Pantalla /dashboard/organizacion/companias, consume 3 endpoint(s).
ruta: /dashboard/organizacion/companias
capa: frontend
archivos:
  - frontend/src/app/dashboard/organizacion/companias/page.tsx
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--front-api]
  - [uses, component--front-exportar]
  - [calls, api--organizacion-companias]
  - [calls, api--organizacion-companias]
  - [calls, api--organizacion-companias]
terminos: [organizacion, companias]
---

# /dashboard/organizacion/companias

Pantalla /dashboard/organizacion/companias, consume 3 endpoint(s).

- **Ruta:** `/dashboard/organizacion/companias`

## Endpoints que consume

- `/organizacion/companias?`
- `/organizacion/companias/`
- `/organizacion/companias`

## Archivos

- `frontend/src/app/dashboard/organizacion/companias/page.tsx`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-exportar|exportar]]
- `calls` → [[api--organizacion-companias|CompaniasController]]
- `calls` → [[api--organizacion-companias|CompaniasController]]
- `calls` → [[api--organizacion-companias|CompaniasController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
