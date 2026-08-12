---
id: screen--dashboard
tipo: SCREEN
nombre: /dashboard
nivel: L1
dominio: seguridad
resumen: Pantalla /dashboard.
ruta: /dashboard
capa: frontend
archivos:
  - frontend/src/app/dashboard/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-api]
  - [uses, component--front-modulos]
  - [uses, component--front-systemicon]
---

# /dashboard

Pantalla /dashboard.

- **Ruta:** `/dashboard`

## Archivos

- `frontend/src/app/dashboard/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-modulos|modulos]]
- `uses` → [[component--front-systemicon|SystemIcon]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
