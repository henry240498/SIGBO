---
id: screen--dashboard-vehiculos
tipo: SCREEN
nombre: /dashboard/vehiculos
nivel: L1
dominio: vehiculos
resumen: Pantalla /dashboard/vehiculos.
ruta: /dashboard/vehiculos
capa: frontend
permisos: [vehiculos:crear]
archivos:
  - frontend/src/app/dashboard/vehiculos/page.tsx
edges:
  - [belongs_to, domain--vehiculos]
  - [uses, component--front-api]
  - [uses, component--front-vehiculos]
  - [uses, component--front-aviso]
terminos: [vehiculos, crear]
---

# /dashboard/vehiculos

Pantalla /dashboard/vehiculos.

- **Ruta:** `/dashboard/vehiculos`
- **Permisos referenciados:** `vehiculos:crear`

## Archivos

- `frontend/src/app/dashboard/vehiculos/page.tsx`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-vehiculos|vehiculos]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
