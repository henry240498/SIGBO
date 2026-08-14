---
id: screen--dashboard-seguridad-permisos
tipo: SCREEN
nombre: /dashboard/seguridad/permisos
nivel: L1
dominio: seguridad
resumen: Pantalla /dashboard/seguridad/permisos, consume 2 endpoint(s).
ruta: /dashboard/seguridad/permisos
capa: frontend
archivos:
  - frontend/src/app/dashboard/seguridad/permisos/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-api]
<<<<<<< Updated upstream
=======
  - [uses, component--front-confirmprovider]
>>>>>>> Stashed changes
  - [calls, api--seguridad-permisos]
  - [calls, api--seguridad-permisos]
terminos: [seguridad, permisos]
---

# /dashboard/seguridad/permisos

Pantalla /dashboard/seguridad/permisos, consume 2 endpoint(s).

- **Ruta:** `/dashboard/seguridad/permisos`

## Endpoints que consume

- `/seguridad/permisos`
- `/seguridad/permisos/`

## Archivos

- `frontend/src/app/dashboard/seguridad/permisos/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-api|api]]
<<<<<<< Updated upstream
=======
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
>>>>>>> Stashed changes
- `calls` → [[api--seguridad-permisos|PermisosController]]
- `calls` → [[api--seguridad-permisos|PermisosController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
