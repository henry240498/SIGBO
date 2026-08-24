---
id: screen--dashboard-organizacion-brigadas
tipo: SCREEN
nombre: /dashboard/organizacion/brigadas
nivel: L1
dominio: organizacion
resumen: Pantalla /dashboard/organizacion/brigadas, consume 2 endpoint(s).
ruta: /dashboard/organizacion/brigadas
capa: frontend
archivos:
  - frontend/src/app/dashboard/organizacion/brigadas/page.tsx
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-api]
  - [uses, component--front-exportar]
  - [calls, api--organizacion-brigadas]
  - [calls, api--organizacion-brigadas]
terminos: [organizacion, brigadas]
---

# /dashboard/organizacion/brigadas

Pantalla /dashboard/organizacion/brigadas, consume 2 endpoint(s).

- **Ruta:** `/dashboard/organizacion/brigadas`

## Endpoints que consume

- `/organizacion/brigadas`
- `/organizacion/brigadas/`

## Archivos

- `frontend/src/app/dashboard/organizacion/brigadas/page.tsx`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-exportar|exportar]]
- `calls` → [[api--organizacion-brigadas|BrigadasController]]
- `calls` → [[api--organizacion-brigadas|BrigadasController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
