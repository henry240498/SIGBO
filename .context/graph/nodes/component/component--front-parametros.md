---
id: component--front-parametros
tipo: COMPONENT
nombre: parametros
nivel: L2
resumen: "Helper de frontend \"parametros\" (5 exportaciones, consume 2 endpoint(s))."
capa: frontend
archivos:
  - frontend/src/lib/parametros.ts
edges:
  - [calls, api--organizacion-parametros]
  - [calls, api--organizacion-parametros]
terminos: [parametros, parametro, tipo, cargar, obtener, resolver, nombres]
---

# parametros

Helper de frontend "parametros" (5 exportaciones, consume 2 endpoint(s)).


## Archivos

- `frontend/src/lib/parametros.ts`

## Relaciones

- `calls` → [[api--organizacion-parametros|ParametrosController]]
- `calls` → [[api--organizacion-parametros|ParametrosController]]

## Referenciado por

- [[screen--dashboard-asistencia-eventos|/dashboard/asistencia/eventos]] `uses` →
- [[screen--dashboard-asistencia-eventos-id|/dashboard/asistencia/eventos/[id]]] `uses` →
- [[screen--dashboard-asistencia-tolerancias|/dashboard/asistencia/tolerancias]] `uses` →
- [[screen--dashboard-guardias-id|/dashboard/guardias/[id]]] `uses` →
- [[screen--dashboard-organizacion-parametros|/dashboard/organizacion/parametros]] `uses` →
- [[screen--dashboard-personal-nuevo|/dashboard/personal/nuevo]] `uses` →
- [[screen--dashboard-personal-id|/dashboard/personal/[id]]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
