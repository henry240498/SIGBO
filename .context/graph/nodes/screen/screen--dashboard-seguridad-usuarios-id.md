---
id: screen--dashboard-seguridad-usuarios-id
tipo: SCREEN
nombre: "/dashboard/seguridad/usuarios/[id]"
nivel: L1
dominio: seguridad
resumen: "Pantalla /dashboard/seguridad/usuarios/[id], consume 4 endpoint(s)."
ruta: /dashboard/seguridad/usuarios/[id]
capa: frontend
archivos:
  - frontend/src/app/dashboard/seguridad/usuarios/[id]/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-api]
  - [uses, component--front-cargando]
  - [uses, component--front-aviso]
  - [calls, api--seguridad-usuarios]
  - [calls, api--seguridad-roles]
  - [calls, api--seguridad-permisos]
  - [calls, api--seguridad-sesiones]
terminos: [seguridad, usuarios]
---

# /dashboard/seguridad/usuarios/[id]

Pantalla /dashboard/seguridad/usuarios/[id], consume 4 endpoint(s).

- **Ruta:** `/dashboard/seguridad/usuarios/[id]`

## Endpoints que consume

- `/seguridad/usuarios/`
- `/seguridad/roles`
- `/seguridad/permisos`
- `/seguridad/sesiones/`

## Archivos

- `frontend/src/app/dashboard/seguridad/usuarios/[id]/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-cargando|Cargando]]
- `uses` → [[component--front-aviso|Aviso]]
- `calls` → [[api--seguridad-usuarios|UsuariosController]]
- `calls` → [[api--seguridad-roles|RolesController]]
- `calls` → [[api--seguridad-permisos|PermisosController]]
- `calls` → [[api--seguridad-sesiones|SesionesController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
