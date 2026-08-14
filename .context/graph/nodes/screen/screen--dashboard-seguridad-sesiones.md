---
id: screen--dashboard-seguridad-sesiones
tipo: SCREEN
nombre: /dashboard/seguridad/sesiones
nivel: L1
dominio: seguridad
resumen: Pantalla /dashboard/seguridad/sesiones, consume 3 endpoint(s).
ruta: /dashboard/seguridad/sesiones
capa: frontend
archivos:
  - frontend/src/app/dashboard/seguridad/sesiones/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-api]
<<<<<<< Updated upstream
=======
  - [uses, component--front-confirmprovider]
>>>>>>> Stashed changes
  - [calls, api--seguridad-sesiones]
  - [calls, api--seguridad-sesiones]
  - [calls, api--seguridad-usuarios]
terminos: [seguridad, sesiones]
---

# /dashboard/seguridad/sesiones

Pantalla /dashboard/seguridad/sesiones, consume 3 endpoint(s).

- **Ruta:** `/dashboard/seguridad/sesiones`

## Endpoints que consume

- `/seguridad/sesiones`
- `/seguridad/sesiones/`
- `/seguridad/usuarios/`

## Archivos

- `frontend/src/app/dashboard/seguridad/sesiones/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-api|api]]
<<<<<<< Updated upstream
=======
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
>>>>>>> Stashed changes
- `calls` → [[api--seguridad-sesiones|SesionesController]]
- `calls` → [[api--seguridad-sesiones|SesionesController]]
- `calls` → [[api--seguridad-usuarios|UsuariosController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
