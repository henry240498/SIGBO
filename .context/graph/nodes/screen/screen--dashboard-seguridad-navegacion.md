---
id: screen--dashboard-seguridad-navegacion
tipo: SCREEN
nombre: /dashboard/seguridad/navegacion
nivel: L1
dominio: seguridad
resumen: Pantalla /dashboard/seguridad/navegacion, consume 2 endpoint(s).
ruta: /dashboard/seguridad/navegacion
capa: frontend
archivos:
  - frontend/src/app/dashboard/seguridad/navegacion/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-api]
  - [calls, api--seguridad-usuarios]
terminos: [seguridad, navegacion]
---

# /dashboard/seguridad/navegacion

Pantalla /dashboard/seguridad/navegacion, consume 2 endpoint(s).

- **Ruta:** `/dashboard/seguridad/navegacion`

## Endpoints que consume

- `/seguridad/usuarios`
- `/navegacion/linea?`

## Archivos

- `frontend/src/app/dashboard/seguridad/navegacion/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-api|api]]
- `calls` → [[api--seguridad-usuarios|UsuariosController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
