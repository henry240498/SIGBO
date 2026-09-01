---
id: screen--dashboard-seguridad-usuarios
tipo: SCREEN
nombre: /dashboard/seguridad/usuarios
nivel: L1
dominio: seguridad
resumen: Pantalla /dashboard/seguridad/usuarios, consume 4 endpoint(s).
ruta: /dashboard/seguridad/usuarios
capa: frontend
archivos:
  - frontend/src/app/dashboard/seguridad/usuarios/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-color]
  - [uses, component--front-inputprovider]
  - [uses, component--front-api]
  - [uses, component--front-aviso]
  - [calls, api--seguridad-usuarios]
  - [calls, api--seguridad-roles]
  - [calls, api--equipos-equipamiento-bombero]
  - [calls, api--seguridad-usuarios]
terminos: [seguridad, usuarios]
---

# /dashboard/seguridad/usuarios

Pantalla /dashboard/seguridad/usuarios, consume 4 endpoint(s).

- **Ruta:** `/dashboard/seguridad/usuarios`

## Endpoints que consume

- `/seguridad/usuarios`
- `/seguridad/roles`
- `/personal/bomberos`
- `/seguridad/usuarios/`

## Archivos

- `frontend/src/app/dashboard/seguridad/usuarios/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-color|color]]
- `uses` → [[component--front-inputprovider|InputProvider]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-aviso|Aviso]]
- `calls` → [[api--seguridad-usuarios|UsuariosController]]
- `calls` → [[api--seguridad-roles|RolesController]]
- `calls` → [[api--equipos-equipamiento-bombero|EquipamientoBomberoController]]
- `calls` → [[api--seguridad-usuarios|UsuariosController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
