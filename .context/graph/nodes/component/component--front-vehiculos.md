---
id: component--front-vehiculos
tipo: COMPONENT
nombre: vehiculos
nivel: L2
dominio: vehiculos
resumen: "Helper de frontend \"vehiculos\" (23 exportaciones, consume 7 endpoint(s))."
capa: frontend
archivos:
  - frontend/src/lib/vehiculos.ts
edges:
  - [calls, api--vehiculos-vehiculos]
  - [calls, api--vehiculos-vehiculos]
  - [calls, api--vehiculos-vehiculos]
  - [calls, api--vehiculos-checklist-items]
  - [calls, api--vehiculos-checklist-items]
  - [calls, api--vehiculos-checklist-items]
  - [calls, api--equipos-equipamiento-bombero]
terminos: [vehiculos, estado, vehiculo, estados, mantenimiento, consumo, combustible, evento, historial, checklist, item, cargar, crear, actualizar, dar, baja, mantenimientos, items]
---

# vehiculos

Helper de frontend "vehiculos" (23 exportaciones, consume 7 endpoint(s)).


## Archivos

- `frontend/src/lib/vehiculos.ts`

## Relaciones

- `calls` → [[api--vehiculos-vehiculos|VehiculosController]]
- `calls` → [[api--vehiculos-vehiculos|VehiculosController]]
- `calls` → [[api--vehiculos-vehiculos|VehiculosController]]
- `calls` → [[api--vehiculos-checklist-items|ChecklistItemsController]]
- `calls` → [[api--vehiculos-checklist-items|ChecklistItemsController]]
- `calls` → [[api--vehiculos-checklist-items|ChecklistItemsController]]
- `calls` → [[api--equipos-equipamiento-bombero|EquipamientoBomberoController]]

## Referenciado por

- [[screen--dashboard-deposito-articulos-id|/dashboard/deposito/articulos/[id]]] `uses` →
- [[screen--dashboard-deposito-bajas|/dashboard/deposito/bajas]] `uses` →
- [[screen--dashboard-deposito-incidencias|/dashboard/deposito/incidencias]] `uses` →
- [[screen--dashboard-deposito-movimientos|/dashboard/deposito/movimientos]] `uses` →
- [[screen--dashboard-equipos-id|/dashboard/equipos/[id]]] `uses` →
- [[screen--dashboard-servicios-nuevo|/dashboard/servicios/nuevo]] `uses` →
- [[screen--dashboard-vehiculos-checklist-items|/dashboard/vehiculos/checklist-items]] `uses` →
- [[screen--dashboard-vehiculos|/dashboard/vehiculos]] `uses` →
- [[screen--dashboard-vehiculos-id|/dashboard/vehiculos/[id]]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
