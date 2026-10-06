---
id: screen--dashboard-vehiculos-flota
tipo: SCREEN
nombre: /dashboard/vehiculos/flota
nivel: L1
dominio: vehiculos
resumen: Pantalla /dashboard/vehiculos/flota.
ruta: /dashboard/vehiculos/flota
capa: frontend
permisos: [servicios:despachar, vehiculos:estado]
archivos:
  - frontend/src/app/dashboard/vehiculos/flota/page.tsx
edges:
  - [belongs_to, domain--vehiculos]
  - [uses, component--front-api]
  - [uses, component--front-flota]
  - [uses, component--front-aviso]
  - [uses, component--front-cargando]
  - [uses, component--front-inputprovider]
terminos: [vehiculos, flota, servicios, despachar, estado]
---

# /dashboard/vehiculos/flota

Pantalla /dashboard/vehiculos/flota.

- **Ruta:** `/dashboard/vehiculos/flota`
- **Permisos referenciados:** `servicios:despachar`, `vehiculos:estado`

## Archivos

- `frontend/src/app/dashboard/vehiculos/flota/page.tsx`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-flota|flota]]
- `uses` → [[component--front-aviso|Aviso]]
- `uses` → [[component--front-cargando|Cargando]]
- `uses` → [[component--front-inputprovider|InputProvider]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
