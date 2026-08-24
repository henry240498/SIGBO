---
id: screen--dashboard-vehiculos-id
tipo: SCREEN
nombre: "/dashboard/vehiculos/[id]"
nivel: L1
dominio: vehiculos
resumen: "Pantalla /dashboard/vehiculos/[id]."
ruta: /dashboard/vehiculos/[id]
capa: frontend
permisos: [vehiculos:editar]
archivos:
  - frontend/src/app/dashboard/vehiculos/[id]/page.tsx
edges:
  - [belongs_to, domain--vehiculos]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-api]
  - [uses, component--front-vehiculos]
terminos: [vehiculos, editar]
---

# /dashboard/vehiculos/[id]

Pantalla /dashboard/vehiculos/[id].

- **Ruta:** `/dashboard/vehiculos/[id]`
- **Permisos referenciados:** `vehiculos:editar`

## Archivos

- `frontend/src/app/dashboard/vehiculos/[id]/page.tsx`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-vehiculos|vehiculos]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
