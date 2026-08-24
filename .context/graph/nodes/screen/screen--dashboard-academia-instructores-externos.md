---
id: screen--dashboard-academia-instructores-externos
tipo: SCREEN
nombre: /dashboard/academia/instructores-externos
nivel: L1
dominio: academia
resumen: Pantalla /dashboard/academia/instructores-externos.
ruta: /dashboard/academia/instructores-externos
capa: frontend
permisos: [academia:gestionar_instructores]
archivos:
  - frontend/src/app/dashboard/academia/instructores-externos/page.tsx
edges:
  - [belongs_to, domain--academia]
  - [uses, component--front-api]
  - [uses, component--front-academia]
terminos: [academia, instructores, externos, gestionar]
---

# /dashboard/academia/instructores-externos

Pantalla /dashboard/academia/instructores-externos.

- **Ruta:** `/dashboard/academia/instructores-externos`
- **Permisos referenciados:** `academia:gestionar_instructores`

## Archivos

- `frontend/src/app/dashboard/academia/instructores-externos/page.tsx`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-academia|academia]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
