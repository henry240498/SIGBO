---
id: screen--dashboard-equipos-categorias
tipo: SCREEN
nombre: /dashboard/equipos/categorias
nivel: L1
dominio: equipos
resumen: Pantalla /dashboard/equipos/categorias.
ruta: /dashboard/equipos/categorias
capa: frontend
permisos: [equipos:editar, equipos:crear, equipos:eliminar]
archivos:
  - frontend/src/app/dashboard/equipos/categorias/page.tsx
edges:
  - [belongs_to, domain--equipos]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-api]
  - [uses, component--front-equipos]
terminos: [equipos, categorias, editar, crear, eliminar]
---

# /dashboard/equipos/categorias

Pantalla /dashboard/equipos/categorias.

- **Ruta:** `/dashboard/equipos/categorias`
- **Permisos referenciados:** `equipos:editar`, `equipos:crear`, `equipos:eliminar`

## Archivos

- `frontend/src/app/dashboard/equipos/categorias/page.tsx`

## Relaciones

- `belongs_to` → [[domain--equipos|Equipos]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-equipos|equipos]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
