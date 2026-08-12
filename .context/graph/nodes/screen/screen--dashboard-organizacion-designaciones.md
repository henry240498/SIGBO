---
id: screen--dashboard-organizacion-designaciones
tipo: SCREEN
nombre: /dashboard/organizacion/designaciones
nivel: L1
dominio: organizacion
resumen: Pantalla /dashboard/organizacion/designaciones, consume 6 endpoint(s).
ruta: /dashboard/organizacion/designaciones
capa: frontend
archivos:
  - frontend/src/app/dashboard/organizacion/designaciones/page.tsx
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--front-api]
  - [uses, component--front-exportar]
  - [calls, api--organizacion-designaciones]
  - [calls, api--equipos-equipamiento-bombero]
  - [calls, api--organizacion-cargos]
  - [calls, api--organizacion-companias]
  - [calls, api--organizacion-cuarteles]
  - [calls, api--organizacion-designaciones]
terminos: [organizacion, designaciones]
---

# /dashboard/organizacion/designaciones

Pantalla /dashboard/organizacion/designaciones, consume 6 endpoint(s).

- **Ruta:** `/dashboard/organizacion/designaciones`

## Endpoints que consume

- `/organizacion/designaciones`
- `/personal/bomberos`
- `/organizacion/cargos`
- `/organizacion/companias`
- `/organizacion/cuarteles`
- `/organizacion/designaciones/`

## Archivos

- `frontend/src/app/dashboard/organizacion/designaciones/page.tsx`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-exportar|exportar]]
- `calls` → [[api--organizacion-designaciones|DesignacionesController]]
- `calls` → [[api--equipos-equipamiento-bombero|EquipamientoBomberoController]]
- `calls` → [[api--organizacion-cargos|CargosController]]
- `calls` → [[api--organizacion-companias|CompaniasController]]
- `calls` → [[api--organizacion-cuarteles|CuartelsController]]
- `calls` → [[api--organizacion-designaciones|DesignacionesController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
