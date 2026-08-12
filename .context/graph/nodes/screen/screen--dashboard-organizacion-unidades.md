---
id: screen--dashboard-organizacion-unidades
tipo: SCREEN
nombre: /dashboard/organizacion/unidades
nivel: L1
dominio: organizacion
resumen: Pantalla /dashboard/organizacion/unidades, consume 4 endpoint(s).
ruta: /dashboard/organizacion/unidades
capa: frontend
archivos:
  - frontend/src/app/dashboard/organizacion/unidades/page.tsx
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--front-api]
  - [uses, component--front-exportar]
  - [calls, api--organizacion-unidades]
  - [calls, api--organizacion-brigadas]
  - [calls, api--organizacion-unidades]
  - [calls, api--organizacion-unidades]
terminos: [organizacion, unidades]
---

# /dashboard/organizacion/unidades

Pantalla /dashboard/organizacion/unidades, consume 4 endpoint(s).

- **Ruta:** `/dashboard/organizacion/unidades`

## Endpoints que consume

- `/organizacion/unidades?`
- `/organizacion/brigadas`
- `/organizacion/unidades/`
- `/organizacion/unidades`

## Archivos

- `frontend/src/app/dashboard/organizacion/unidades/page.tsx`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-exportar|exportar]]
- `calls` → [[api--organizacion-unidades|UnidadesController]]
- `calls` → [[api--organizacion-brigadas|BrigadasController]]
- `calls` → [[api--organizacion-unidades|UnidadesController]]
- `calls` → [[api--organizacion-unidades|UnidadesController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
