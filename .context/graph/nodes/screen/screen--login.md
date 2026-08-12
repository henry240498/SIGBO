---
id: screen--login
tipo: SCREEN
nombre: /login
nivel: L1
dominio: seguridad
resumen: Pantalla /login, consume 1 endpoint(s).
ruta: /login
capa: frontend
archivos:
  - frontend/src/app/login/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-api]
  - [calls, api--seguridad-apariencia]
terminos: [login]
---

# /login

Pantalla /login, consume 1 endpoint(s).

- **Ruta:** `/login`

## Endpoints que consume

- `/seguridad/apariencia`

## Archivos

- `frontend/src/app/login/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-api|api]]
- `calls` → [[api--seguridad-apariencia|AparienciaController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
