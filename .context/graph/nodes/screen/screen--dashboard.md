---
id: screen--dashboard
tipo: SCREEN
nombre: /dashboard
nivel: L1
dominio: seguridad
resumen: Pantalla /dashboard, consume 1 endpoint(s).
ruta: /dashboard
capa: frontend
archivos:
  - frontend/src/app/dashboard/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-api]
  - [uses, component--front-modulos]
  - [uses, component--front-systemicon]
  - [calls, api--seguridad-me]
---

# /dashboard

Pantalla /dashboard, consume 1 endpoint(s).

- **Ruta:** `/dashboard`

## Endpoints que consume

- `/seguridad/mi-inicio`

## Archivos

- `frontend/src/app/dashboard/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-modulos|modulos]]
- `uses` → [[component--front-systemicon|SystemIcon]]
- `calls` → [[api--seguridad-me|MeController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
