---
id: screen--dashboard-mi-perfil
tipo: SCREEN
nombre: /dashboard/mi-perfil
nivel: L1
dominio: seguridad
resumen: Pantalla /dashboard/mi-perfil, consume 2 endpoint(s).
ruta: /dashboard/mi-perfil
capa: frontend
archivos:
  - frontend/src/app/dashboard/mi-perfil/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-api]
  - [calls, api--seguridad-me]
  - [calls, api--seguridad-me]
terminos: [perfil]
---

# /dashboard/mi-perfil

Pantalla /dashboard/mi-perfil, consume 2 endpoint(s).

- **Ruta:** `/dashboard/mi-perfil`

## Endpoints que consume

- `/seguridad/mi-perfil`
- `/seguridad/me/password`

## Archivos

- `frontend/src/app/dashboard/mi-perfil/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-api|api]]
- `calls` → [[api--seguridad-me|MeController]]
- `calls` → [[api--seguridad-me|MeController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
