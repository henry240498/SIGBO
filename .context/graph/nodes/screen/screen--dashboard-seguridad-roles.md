---
id: screen--dashboard-seguridad-roles
tipo: SCREEN
nombre: /dashboard/seguridad/roles
nivel: L1
dominio: seguridad
resumen: Pantalla /dashboard/seguridad/roles, consume 3 endpoint(s).
ruta: /dashboard/seguridad/roles
capa: frontend
archivos:
  - frontend/src/app/dashboard/seguridad/roles/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-color]
  - [uses, component--front-inputprovider]
  - [uses, component--front-api]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-aviso]
  - [calls, api--seguridad-roles]
  - [calls, api--seguridad-permisos]
  - [calls, api--seguridad-roles]
terminos: [seguridad, roles]
---

# /dashboard/seguridad/roles

Pantalla /dashboard/seguridad/roles, consume 3 endpoint(s).

- **Ruta:** `/dashboard/seguridad/roles`

## Endpoints que consume

- `/seguridad/roles`
- `/seguridad/permisos`
- `/seguridad/roles/`

## Archivos

- `frontend/src/app/dashboard/seguridad/roles/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-color|color]]
- `uses` → [[component--front-inputprovider|InputProvider]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-aviso|Aviso]]
- `calls` → [[api--seguridad-roles|RolesController]]
- `calls` → [[api--seguridad-permisos|PermisosController]]
- `calls` → [[api--seguridad-roles|RolesController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
