---
id: component--front-cartografia
tipo: COMPONENT
nombre: cartografia
nivel: L2
resumen: "Helper de frontend \"cartografia\" (14 exportaciones, consume 4 endpoint(s))."
capa: frontend
archivos:
  - frontend/src/lib/cartografia.ts
edges:
  - [calls, api--cartografia-cartografia]
  - [calls, api--cartografia-cartografia]
  - [calls, api--cartografia-cartografia]
  - [calls, api--cartografia-cartografia]
terminos: [cartografia, estado, hidrante, nivel, riesgo, punto, preplan, cargar, hidrantes, puntos, crear, actualizar, historial, guardar]
---

# cartografia

Helper de frontend "cartografia" (14 exportaciones, consume 4 endpoint(s)).


## Archivos

- `frontend/src/lib/cartografia.ts`

## Relaciones

- `calls` → [[api--cartografia-cartografia|CartografiaController]]
- `calls` → [[api--cartografia-cartografia|CartografiaController]]
- `calls` → [[api--cartografia-cartografia|CartografiaController]]
- `calls` → [[api--cartografia-cartografia|CartografiaController]]

## Referenciado por

- [[screen--dashboard-servicios-cartografia|/dashboard/servicios/cartografia]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
