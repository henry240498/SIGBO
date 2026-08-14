---
id: screen--dashboard-denuncias-id
tipo: SCREEN
nombre: "/dashboard/denuncias/[id]"
nivel: L1
dominio: denuncias
resumen: "Pantalla /dashboard/denuncias/[id], consume 2 endpoint(s)."
ruta: /dashboard/denuncias/[id]
capa: frontend
archivos:
  - frontend/src/app/dashboard/denuncias/[id]/page.tsx
edges:
  - [belongs_to, domain--denuncias]
  - [uses, component--front-api]
  - [calls, api--denuncias-denuncias]
  - [calls, api--denuncias-denuncias]
terminos: [denuncias]
---

# /dashboard/denuncias/[id]

Pantalla /dashboard/denuncias/[id], consume 2 endpoint(s).

- **Ruta:** `/dashboard/denuncias/[id]`

## Endpoints que consume

- `/denuncias/`
- `/denuncias/asignables`

## Archivos

- `frontend/src/app/dashboard/denuncias/[id]/page.tsx`

## Relaciones

- `belongs_to` → [[domain--denuncias|Denuncias]]
- `uses` → [[component--front-api|api]]
- `calls` → [[api--denuncias-denuncias|DenunciasController]]
- `calls` → [[api--denuncias-denuncias|DenunciasController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
