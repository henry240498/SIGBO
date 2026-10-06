---
id: screen--dashboard-reportar
tipo: SCREEN
nombre: /dashboard/reportar
nivel: L1
dominio: seguridad
resumen: Pantalla /dashboard/reportar, consume 1 endpoint(s).
ruta: /dashboard/reportar
capa: frontend
archivos:
  - frontend/src/app/dashboard/reportar/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-api]
  - [uses, component--front-aviso]
  - [calls, api--reportes-reportes]
terminos: [reportar]
---

# /dashboard/reportar

Pantalla /dashboard/reportar, consume 1 endpoint(s).

- **Ruta:** `/dashboard/reportar`

## Endpoints que consume

- `/reportes`

## Archivos

- `frontend/src/app/dashboard/reportar/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-aviso|Aviso]]
- `calls` → [[api--reportes-reportes|ReportesController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
