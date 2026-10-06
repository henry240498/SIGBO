---
id: screen--dashboard-vehiculos-mapa
tipo: SCREEN
nombre: /dashboard/vehiculos/mapa
nivel: L1
dominio: vehiculos
resumen: Pantalla /dashboard/vehiculos/mapa.
ruta: /dashboard/vehiculos/mapa
capa: frontend
archivos:
  - frontend/src/app/dashboard/vehiculos/mapa/page.tsx
edges:
  - [belongs_to, domain--vehiculos]
  - [uses, component--front-flota]
  - [uses, component--front-aviso]
terminos: [vehiculos, mapa]
---

# /dashboard/vehiculos/mapa

Pantalla /dashboard/vehiculos/mapa.

- **Ruta:** `/dashboard/vehiculos/mapa`

## Archivos

- `frontend/src/app/dashboard/vehiculos/mapa/page.tsx`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `uses` → [[component--front-flota|flota]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
