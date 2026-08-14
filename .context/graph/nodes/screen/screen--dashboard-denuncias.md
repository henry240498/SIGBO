---
id: screen--dashboard-denuncias
tipo: SCREEN
nombre: /dashboard/denuncias
nivel: L1
dominio: denuncias
resumen: Pantalla /dashboard/denuncias, consume 2 endpoint(s).
ruta: /dashboard/denuncias
capa: frontend
archivos:
  - frontend/src/app/dashboard/denuncias/page.tsx
edges:
  - [belongs_to, domain--denuncias]
  - [uses, component--front-api]
  - [calls, api--denuncias-denuncias]
  - [calls, api--denuncias-denuncias]
terminos: [denuncias]
---

# /dashboard/denuncias

Pantalla /dashboard/denuncias, consume 2 endpoint(s).

- **Ruta:** `/dashboard/denuncias`

## Endpoints que consume

- `/denuncias?`
- `/denuncias/resumen`

## Archivos

- `frontend/src/app/dashboard/denuncias/page.tsx`

## Relaciones

- `belongs_to` → [[domain--denuncias|Denuncias]]
- `uses` → [[component--front-api|api]]
- `calls` → [[api--denuncias-denuncias|DenunciasController]]
- `calls` → [[api--denuncias-denuncias|DenunciasController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
