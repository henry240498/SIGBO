---
id: screen--dashboard-organizacion-reportes
tipo: SCREEN
nombre: /dashboard/organizacion/reportes
nivel: L1
dominio: organizacion
resumen: Pantalla /dashboard/organizacion/reportes.
ruta: /dashboard/organizacion/reportes
capa: frontend
archivos:
  - frontend/src/app/dashboard/organizacion/reportes/page.tsx
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--front-exportar]
terminos: [organizacion, reportes]
---

# /dashboard/organizacion/reportes

Pantalla /dashboard/organizacion/reportes.

- **Ruta:** `/dashboard/organizacion/reportes`

## Archivos

- `frontend/src/app/dashboard/organizacion/reportes/page.tsx`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--front-exportar|exportar]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
