---
id: component--front-flota
tipo: COMPONENT
nombre: flota
nivel: L2
resumen: "Helper de frontend \"flota\" (29 exportaciones, consume 12 endpoint(s))."
capa: frontend
archivos:
  - frontend/src/lib/flota.ts
edges:
  - [calls, api--flota-flota]
  - [calls, api--flota-flota]
  - [calls, api--flota-flota]
  - [calls, api--flota-flota]
  - [calls, api--flota-flota]
  - [calls, api--flota-flota]
  - [calls, api--flota-flota]
  - [calls, api--flota-flota]
  - [calls, api--flota-flota]
  - [calls, api--flota-flota]
  - [calls, api--flota-flota]
  - [calls, api--flota-flota]
terminos: [flota, estado, operativo, movil, tablero, servicio, abierto, leer, json, headers, cargar, servicios, abiertos, despachar, avanzar, despacho, cancelar, reponer, cuartel, posicion, vencimiento, posiciones, vencimientos, disponibilidad, descargar, resumen, pdf, item, dotacion, faltante]
---

# flota

Helper de frontend "flota" (29 exportaciones, consume 12 endpoint(s)).


## Archivos

- `frontend/src/lib/flota.ts`

## Relaciones

- `calls` → [[api--flota-flota|FlotaController]]
- `calls` → [[api--flota-flota|FlotaController]]
- `calls` → [[api--flota-flota|FlotaController]]
- `calls` → [[api--flota-flota|FlotaController]]
- `calls` → [[api--flota-flota|FlotaController]]
- `calls` → [[api--flota-flota|FlotaController]]
- `calls` → [[api--flota-flota|FlotaController]]
- `calls` → [[api--flota-flota|FlotaController]]
- `calls` → [[api--flota-flota|FlotaController]]
- `calls` → [[api--flota-flota|FlotaController]]
- `calls` → [[api--flota-flota|FlotaController]]
- `calls` → [[api--flota-flota|FlotaController]]

## Referenciado por

- [[screen--dashboard-servicios-llamados|/dashboard/servicios/llamados]] `uses` →
- [[screen--dashboard-vehiculos-dotacion|/dashboard/vehiculos/dotacion]] `uses` →
- [[screen--dashboard-vehiculos-flota|/dashboard/vehiculos/flota]] `uses` →
- [[screen--dashboard-vehiculos-mapa|/dashboard/vehiculos/mapa]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
