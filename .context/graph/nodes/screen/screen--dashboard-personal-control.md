---
id: screen--dashboard-personal-control
tipo: SCREEN
nombre: /dashboard/personal/control
nivel: L1
dominio: personal
resumen: Pantalla /dashboard/personal/control.
ruta: /dashboard/personal/control
capa: frontend
permisos: [guardias:ver, guardias:editar, asistencia:ver, asistencia:editar, personal:editar, personal:editar_medico]
archivos:
  - frontend/src/app/dashboard/personal/control/page.tsx
edges:
  - [belongs_to, domain--personal]
  - [uses, component--front-api]
  - [uses, component--front-control-personal]
  - [uses, component--front-aviso]
  - [uses, component--front-cargando]
  - [uses, component--front-personal]
terminos: [personal, control, guardias, ver, editar, asistencia, medico]
---

# /dashboard/personal/control

Pantalla /dashboard/personal/control.

- **Ruta:** `/dashboard/personal/control`
- **Permisos referenciados:** `guardias:ver`, `guardias:editar`, `asistencia:ver`, `asistencia:editar`, `personal:editar`, `personal:editar_medico`

## Archivos

- `frontend/src/app/dashboard/personal/control/page.tsx`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-control-personal|control-personal]]
- `uses` → [[component--front-aviso|Aviso]]
- `uses` → [[component--front-cargando|Cargando]]
- `uses` → [[component--front-personal|personal]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
