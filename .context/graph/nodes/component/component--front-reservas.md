---
id: component--front-reservas
tipo: COMPONENT
nombre: reservas
nivel: L2
dominio: reservas
resumen: "Helper de frontend \"reservas\" (13 exportaciones, consume 5 endpoint(s))."
capa: frontend
archivos:
  - frontend/src/lib/reservas.ts
edges:
  - [calls, api--reservas-reservas]
  - [calls, api--reservas-reservas]
  - [calls, api--reservas-reservas]
  - [calls, api--prevencion-prevencion]
  - [calls, api--prevencion-prevencion]
terminos: [reservas, instalacion, estado, reserva, resultado, inspeccion, establecimiento, cargar, instalaciones, crear, solicitar, decidir, cancelar, prevencion, registrar]
---

# reservas

Helper de frontend "reservas" (13 exportaciones, consume 5 endpoint(s)).


## Archivos

- `frontend/src/lib/reservas.ts`

## Relaciones

- `calls` → [[api--reservas-reservas|ReservasController]]
- `calls` → [[api--reservas-reservas|ReservasController]]
- `calls` → [[api--reservas-reservas|ReservasController]]
- `calls` → [[api--prevencion-prevencion|PrevencionController]]
- `calls` → [[api--prevencion-prevencion|PrevencionController]]

## Referenciado por

- [[screen--dashboard-reservas|/dashboard/reservas]] `uses` →
- [[screen--dashboard-servicios-prevencion|/dashboard/servicios/prevencion]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
