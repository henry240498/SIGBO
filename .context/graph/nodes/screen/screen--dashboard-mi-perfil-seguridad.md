---
id: screen--dashboard-mi-perfil-seguridad
tipo: SCREEN
nombre: /dashboard/mi-perfil/seguridad
nivel: L1
dominio: seguridad
resumen: Pantalla /dashboard/mi-perfil/seguridad, consume 3 endpoint(s).
ruta: /dashboard/mi-perfil/seguridad
capa: frontend
archivos:
  - frontend/src/app/dashboard/mi-perfil/seguridad/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-api]
  - [calls, api--seguridad-sesiones]
  - [calls, api--seguridad-sesiones]
  - [calls, api--seguridad-sesiones]
terminos: [perfil, seguridad]
---

# /dashboard/mi-perfil/seguridad

Pantalla /dashboard/mi-perfil/seguridad, consume 3 endpoint(s).

- **Ruta:** `/dashboard/mi-perfil/seguridad`

## Endpoints que consume

- `/seguridad/sesiones/mias`
- `/seguridad/sesiones/mias/`
- `/seguridad/sesiones/mias/cerrar-todas`

## Archivos

- `frontend/src/app/dashboard/mi-perfil/seguridad/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-api|api]]
- `calls` → [[api--seguridad-sesiones|SesionesController]]
- `calls` → [[api--seguridad-sesiones|SesionesController]]
- `calls` → [[api--seguridad-sesiones|SesionesController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
