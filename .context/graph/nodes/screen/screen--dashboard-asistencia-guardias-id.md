---
id: screen--dashboard-asistencia-guardias-id
tipo: SCREEN
nombre: "/dashboard/asistencia/guardias/[id]"
nivel: L1
dominio: asistencia
resumen: "Pantalla /dashboard/asistencia/guardias/[id], consume 1 endpoint(s)."
ruta: /dashboard/asistencia/guardias/[id]
capa: frontend
permisos: [asistencia:guardias_editar]
archivos:
  - frontend/src/app/dashboard/asistencia/guardias/[id]/page.tsx
edges:
  - [belongs_to, domain--asistencia]
  - [uses, component--front-api]
  - [uses, component--front-personal]
  - [uses, component--front-asistencia]
  - [calls, api--operaciones-guardias]
terminos: [asistencia, guardias, editar]
---

# /dashboard/asistencia/guardias/[id]

Pantalla /dashboard/asistencia/guardias/[id], consume 1 endpoint(s).

- **Ruta:** `/dashboard/asistencia/guardias/[id]`
- **Permisos referenciados:** `asistencia:guardias_editar`

## Endpoints que consume

- `/operaciones/guardias/`

## Archivos

- `frontend/src/app/dashboard/asistencia/guardias/[id]/page.tsx`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-personal|personal]]
- `uses` → [[component--front-asistencia|asistencia]]
- `calls` → [[api--operaciones-guardias|GuardiasController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
