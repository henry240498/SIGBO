---
id: screen--dashboard-organizacion-departamentos
tipo: SCREEN
nombre: /dashboard/organizacion/departamentos
nivel: L1
dominio: organizacion
resumen: Pantalla /dashboard/organizacion/departamentos, consume 3 endpoint(s).
ruta: /dashboard/organizacion/departamentos
capa: frontend
archivos:
  - frontend/src/app/dashboard/organizacion/departamentos/page.tsx
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-api]
  - [uses, component--front-exportar]
  - [uses, component--front-aviso]
  - [calls, api--organizacion-departamentos]
  - [calls, api--organizacion-departamentos]
  - [calls, api--organizacion-departamentos]
terminos: [organizacion, departamentos]
---

# /dashboard/organizacion/departamentos

Pantalla /dashboard/organizacion/departamentos, consume 3 endpoint(s).

- **Ruta:** `/dashboard/organizacion/departamentos`

## Endpoints que consume

- `/organizacion/departamentos?`
- `/organizacion/departamentos/`
- `/organizacion/departamentos`

## Archivos

- `frontend/src/app/dashboard/organizacion/departamentos/page.tsx`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-exportar|exportar]]
- `uses` → [[component--front-aviso|Aviso]]
- `calls` → [[api--organizacion-departamentos|DepartamentosController]]
- `calls` → [[api--organizacion-departamentos|DepartamentosController]]
- `calls` → [[api--organizacion-departamentos|DepartamentosController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
