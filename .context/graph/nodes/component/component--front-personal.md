---
id: component--front-personal
tipo: COMPONENT
nombre: personal
nivel: L2
dominio: personal
resumen: "Helper de frontend \"personal\" (10 exportaciones, consume 2 endpoint(s))."
capa: frontend
archivos:
  - frontend/src/lib/personal.ts
edges:
  - [calls, api--personal-tipos-bombero]
  - [calls, api--equipos-equipamiento-bombero]
terminos: [personal, tipo, bombero, resumen, estados, cargar, tipos, bomberos, construir, extraer, numero, codigo, comparar, institucional, catalogo]
---

# personal

Helper de frontend "personal" (10 exportaciones, consume 2 endpoint(s)).


## Archivos

- `frontend/src/lib/personal.ts`

## Relaciones

- `calls` → [[api--personal-tipos-bombero|TiposBomberoController]]
- `calls` → [[api--equipos-equipamiento-bombero|EquipamientoBomberoController]]

## Referenciado por

- [[screen--dashboard-asistencia-eventos-id|/dashboard/asistencia/eventos/[id]]] `uses` →
- [[screen--dashboard-asistencia-registro|/dashboard/asistencia/registro]] `uses` →
- [[screen--dashboard-equipos-id|/dashboard/equipos/[id]]] `uses` →
- [[screen--dashboard-guardias-grupos|/dashboard/guardias/grupos]] `uses` →
- [[screen--dashboard-guardias-grupos-id|/dashboard/guardias/grupos/[id]]] `uses` →
- [[screen--dashboard-guardias-ordenes-configuracion|/dashboard/guardias/ordenes/configuracion]] `uses` →
- [[screen--dashboard-guardias-pernoctes|/dashboard/guardias/pernoctes]] `uses` →
- [[screen--dashboard-guardias-requisitos|/dashboard/guardias/requisitos]] `uses` →
- [[screen--dashboard-guardias-id|/dashboard/guardias/[id]]] `uses` →
- [[screen--dashboard-personal|/dashboard/personal]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
