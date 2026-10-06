---
id: screen--dashboard-vehiculos-dotacion
tipo: SCREEN
nombre: /dashboard/vehiculos/dotacion
nivel: L1
dominio: vehiculos
resumen: Pantalla /dashboard/vehiculos/dotacion.
ruta: /dashboard/vehiculos/dotacion
capa: frontend
permisos: [vehiculos:dotacion]
archivos:
  - frontend/src/app/dashboard/vehiculos/dotacion/page.tsx
edges:
  - [belongs_to, domain--vehiculos]
  - [uses, component--front-api]
  - [uses, component--front-flota]
  - [uses, component--front-aviso]
  - [uses, component--front-cargando]
terminos: [vehiculos, dotacion]
---

# /dashboard/vehiculos/dotacion

Pantalla /dashboard/vehiculos/dotacion.

- **Ruta:** `/dashboard/vehiculos/dotacion`
- **Permisos referenciados:** `vehiculos:dotacion`

## Archivos

- `frontend/src/app/dashboard/vehiculos/dotacion/page.tsx`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-flota|flota]]
- `uses` → [[component--front-aviso|Aviso]]
- `uses` → [[component--front-cargando|Cargando]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
