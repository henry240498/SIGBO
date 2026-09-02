---
id: screen--dashboard-personal-id
tipo: SCREEN
nombre: "/dashboard/personal/[id]"
nivel: L1
dominio: personal
resumen: "Pantalla /dashboard/personal/[id], consume 1 endpoint(s)."
ruta: /dashboard/personal/[id]
capa: frontend
permisos: [personal:editar, personal:eliminar_fisico]
archivos:
  - frontend/src/app/dashboard/personal/[id]/page.tsx
edges:
  - [belongs_to, domain--personal]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-api]
  - [uses, component--front-cargando]
  - [uses, component--front-aviso]
  - [uses, component--front-seccion-url]
  - [calls, api--equipos-equipamiento-bombero]
terminos: [personal, editar, eliminar, fisico]
---

# /dashboard/personal/[id]

Pantalla /dashboard/personal/[id], consume 1 endpoint(s).

- **Ruta:** `/dashboard/personal/[id]`
- **Permisos referenciados:** `personal:editar`, `personal:eliminar_fisico`

## Endpoints que consume

- `/personal/bomberos/`

## Archivos

- `frontend/src/app/dashboard/personal/[id]/page.tsx`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-cargando|Cargando]]
- `uses` → [[component--front-aviso|Aviso]]
- `uses` → [[component--front-seccion-url|seccion-url]]
- `calls` → [[api--equipos-equipamiento-bombero|EquipamientoBomberoController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
