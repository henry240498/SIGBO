---
id: screen--dashboard-organizacion-cuarteles
tipo: SCREEN
nombre: /dashboard/organizacion/cuarteles
nivel: L1
dominio: organizacion
resumen: Pantalla /dashboard/organizacion/cuarteles, consume 5 endpoint(s).
ruta: /dashboard/organizacion/cuarteles
capa: frontend
archivos:
  - frontend/src/app/dashboard/organizacion/cuarteles/page.tsx
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--front-api]
  - [uses, component--front-exportar]
  - [calls, api--organizacion-cuarteles]
  - [calls, api--organizacion-companias]
  - [calls, api--equipos-equipamiento-bombero]
  - [calls, api--organizacion-cuarteles]
  - [calls, api--organizacion-cuarteles]
terminos: [organizacion, cuarteles]
---

# /dashboard/organizacion/cuarteles

Pantalla /dashboard/organizacion/cuarteles, consume 5 endpoint(s).

- **Ruta:** `/dashboard/organizacion/cuarteles`

## Endpoints que consume

- `/organizacion/cuarteles?`
- `/organizacion/companias`
- `/personal/bomberos`
- `/organizacion/cuarteles/`
- `/organizacion/cuarteles`

## Archivos

- `frontend/src/app/dashboard/organizacion/cuarteles/page.tsx`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-exportar|exportar]]
- `calls` → [[api--organizacion-cuarteles|CuartelsController]]
- `calls` → [[api--organizacion-companias|CompaniasController]]
- `calls` → [[api--equipos-equipamiento-bombero|EquipamientoBomberoController]]
- `calls` → [[api--organizacion-cuarteles|CuartelsController]]
- `calls` → [[api--organizacion-cuarteles|CuartelsController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
