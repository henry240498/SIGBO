---
id: screen--dashboard-guardias-ordenes-id
tipo: SCREEN
nombre: "/dashboard/guardias/ordenes/[id]"
nivel: L1
dominio: guardias
resumen: "Pantalla /dashboard/guardias/ordenes/[id]."
ruta: /dashboard/guardias/ordenes/[id]
capa: frontend
permisos: [guardias:ordenes_editar, guardias:ordenes_aprobar, guardias:ordenes_publicar, guardias:ordenes_anular]
archivos:
  - frontend/src/app/dashboard/guardias/ordenes/[id]/page.tsx
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--front-inputprovider]
  - [uses, component--front-api]
  - [uses, component--front-json-seguro]
  - [uses, component--front-guardias]
  - [uses, component--front-cargando]
  - [uses, component--front-aviso]
terminos: [guardias, ordenes, editar, aprobar, publicar, anular]
---

# /dashboard/guardias/ordenes/[id]

Pantalla /dashboard/guardias/ordenes/[id].

- **Ruta:** `/dashboard/guardias/ordenes/[id]`
- **Permisos referenciados:** `guardias:ordenes_editar`, `guardias:ordenes_aprobar`, `guardias:ordenes_publicar`, `guardias:ordenes_anular`

## Archivos

- `frontend/src/app/dashboard/guardias/ordenes/[id]/page.tsx`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--front-inputprovider|InputProvider]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-json-seguro|json-seguro]]
- `uses` → [[component--front-guardias|guardias]]
- `uses` → [[component--front-cargando|Cargando]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
