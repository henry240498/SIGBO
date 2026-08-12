---
id: screen--dashboard-organizacion-ascensos
tipo: SCREEN
nombre: /dashboard/organizacion/ascensos
nivel: L1
dominio: organizacion
resumen: Pantalla /dashboard/organizacion/ascensos, consume 4 endpoint(s).
ruta: /dashboard/organizacion/ascensos
capa: frontend
archivos:
  - frontend/src/app/dashboard/organizacion/ascensos/page.tsx
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--front-api]
  - [uses, component--front-exportar]
  - [calls, api--organizacion-ascensos]
  - [calls, api--equipos-equipamiento-bombero]
  - [calls, api--organizacion-rangos]
  - [calls, api--organizacion-ascensos]
terminos: [organizacion, ascensos]
---

# /dashboard/organizacion/ascensos

Pantalla /dashboard/organizacion/ascensos, consume 4 endpoint(s).

- **Ruta:** `/dashboard/organizacion/ascensos`

## Endpoints que consume

- `/organizacion/ascensos`
- `/personal/bomberos`
- `/organizacion/rangos`
- `/organizacion/ascensos/`

## Archivos

- `frontend/src/app/dashboard/organizacion/ascensos/page.tsx`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-exportar|exportar]]
- `calls` → [[api--organizacion-ascensos|AscensosController]]
- `calls` → [[api--equipos-equipamiento-bombero|EquipamientoBomberoController]]
- `calls` → [[api--organizacion-rangos|RangosController]]
- `calls` → [[api--organizacion-ascensos|AscensosController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
