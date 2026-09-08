---
id: screen--dashboard-organizacion-turnos
tipo: SCREEN
nombre: /dashboard/organizacion/turnos
nivel: L1
dominio: organizacion
resumen: Pantalla /dashboard/organizacion/turnos, consume 4 endpoint(s).
ruta: /dashboard/organizacion/turnos
capa: frontend
archivos:
  - frontend/src/app/dashboard/organizacion/turnos/page.tsx
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-api]
  - [uses, component--front-exportar]
  - [uses, component--front-aviso]
  - [calls, api--organizacion-turnos]
  - [calls, api--equipos-equipamiento-bombero]
  - [calls, api--organizacion-turnos]
  - [calls, api--organizacion-turnos]
terminos: [organizacion, turnos]
---

# /dashboard/organizacion/turnos

Pantalla /dashboard/organizacion/turnos, consume 4 endpoint(s).

- **Ruta:** `/dashboard/organizacion/turnos`

## Endpoints que consume

- `/organizacion/turnos?`
- `/personal/bomberos`
- `/organizacion/turnos/`
- `/organizacion/turnos`

## Archivos

- `frontend/src/app/dashboard/organizacion/turnos/page.tsx`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-exportar|exportar]]
- `uses` → [[component--front-aviso|Aviso]]
- `calls` → [[api--organizacion-turnos|TurnosController]]
- `calls` → [[api--equipos-equipamiento-bombero|EquipamientoBomberoController]]
- `calls` → [[api--organizacion-turnos|TurnosController]]
- `calls` → [[api--organizacion-turnos|TurnosController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
