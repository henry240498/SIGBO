---
id: screen--dashboard-publicaciones
tipo: SCREEN
nombre: /dashboard/publicaciones
nivel: L1
dominio: publicaciones
resumen: Pantalla /dashboard/publicaciones.
ruta: /dashboard/publicaciones
capa: frontend
archivos:
  - frontend/src/app/dashboard/publicaciones/page.tsx
edges:
  - [belongs_to, domain--publicaciones]
  - [uses, component--front-publicaciones]
  - [uses, component--front-confirmprovider]
terminos: [publicaciones]
---

# /dashboard/publicaciones

Pantalla /dashboard/publicaciones.

- **Ruta:** `/dashboard/publicaciones`

## Archivos

- `frontend/src/app/dashboard/publicaciones/page.tsx`

## Relaciones

- `belongs_to` → [[domain--publicaciones|Publicaciones]]
- `uses` → [[component--front-publicaciones|publicaciones]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
