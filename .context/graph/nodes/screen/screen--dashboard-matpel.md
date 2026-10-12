---
id: screen--dashboard-matpel
tipo: SCREEN
nombre: /dashboard/matpel
nivel: L1
dominio: matpel
resumen: Pantalla /dashboard/matpel, consume 1 endpoint(s).
ruta: /dashboard/matpel
capa: frontend
archivos:
  - frontend/src/app/dashboard/matpel/page.tsx
edges:
  - [belongs_to, domain--matpel]
  - [uses, component--front-api]
  - [uses, component--front-matpel]
  - [uses, component--front-aviso]
  - [calls, api--gre-matpel-consulta]
terminos: [matpel]
---

# /dashboard/matpel

Pantalla /dashboard/matpel, consume 1 endpoint(s).

- **Ruta:** `/dashboard/matpel`

## Endpoints que consume

- `/matpel/versiones/`

## Archivos

- `frontend/src/app/dashboard/matpel/page.tsx`

## Relaciones

- `belongs_to` → [[domain--matpel|MATPEL]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-matpel|matpel]]
- `uses` → [[component--front-aviso|Aviso]]
- `calls` → [[api--gre-matpel-consulta|MatpelConsultaController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
