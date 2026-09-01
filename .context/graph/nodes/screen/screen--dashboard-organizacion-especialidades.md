---
id: screen--dashboard-organizacion-especialidades
tipo: SCREEN
nombre: /dashboard/organizacion/especialidades
nivel: L1
dominio: organizacion
resumen: Pantalla /dashboard/organizacion/especialidades, consume 3 endpoint(s).
ruta: /dashboard/organizacion/especialidades
capa: frontend
archivos:
  - frontend/src/app/dashboard/organizacion/especialidades/page.tsx
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-api]
  - [uses, component--front-exportar]
  - [uses, component--front-aviso]
  - [calls, api--organizacion-especialidades]
  - [calls, api--organizacion-especialidades]
  - [calls, api--organizacion-especialidades]
terminos: [organizacion, especialidades]
---

# /dashboard/organizacion/especialidades

Pantalla /dashboard/organizacion/especialidades, consume 3 endpoint(s).

- **Ruta:** `/dashboard/organizacion/especialidades`

## Endpoints que consume

- `/organizacion/especialidades?`
- `/organizacion/especialidades/`
- `/organizacion/especialidades`

## Archivos

- `frontend/src/app/dashboard/organizacion/especialidades/page.tsx`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-exportar|exportar]]
- `uses` → [[component--front-aviso|Aviso]]
- `calls` → [[api--organizacion-especialidades|EspecialidadesController]]
- `calls` → [[api--organizacion-especialidades|EspecialidadesController]]
- `calls` → [[api--organizacion-especialidades|EspecialidadesController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
