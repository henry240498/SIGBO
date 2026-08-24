---
id: component--front-asistencia
tipo: COMPONENT
nombre: asistencia
nivel: L2
dominio: asistencia
resumen: "Helper de frontend \"asistencia\" (42 exportaciones, consume 15 endpoint(s))."
capa: frontend
archivos:
  - frontend/src/lib/asistencia.ts
edges:
  - [calls, api--operaciones-eventos-asistencia]
  - [calls, api--operaciones-eventos-asistencia]
  - [calls, api--operaciones-eventos-asistencia]
  - [calls, api--operaciones-marcaciones]
  - [calls, api--operaciones-marcaciones]
  - [calls, api--operaciones-marcaciones]
  - [calls, api--operaciones-marcaciones]
  - [calls, api--operaciones-marcaciones]
  - [calls, api--operaciones-participantes-externos]
  - [calls, api--operaciones-participantes-externos]
  - [calls, api--operaciones-participantes-externos]
  - [calls, api--operaciones-tolerancias]
  - [calls, api--operaciones-dashboard-asistencia]
  - [calls, api--operaciones-importaciones]
  - [calls, api--operaciones-importaciones]
terminos: [asistencia, evento, participante, externo, input, marcacion, solapamiento, tolerancia, indicadores, estado, fila, importacion, marcador, cargar, tipos, eventos, crear, actualizar, participantes, agregar, bombero]
---

# asistencia

Helper de frontend "asistencia" (42 exportaciones, consume 15 endpoint(s)).


## Archivos

- `frontend/src/lib/asistencia.ts`

## Relaciones

- `calls` → [[api--operaciones-eventos-asistencia|EventosAsistenciaController]]
- `calls` → [[api--operaciones-eventos-asistencia|EventosAsistenciaController]]
- `calls` → [[api--operaciones-eventos-asistencia|EventosAsistenciaController]]
- `calls` → [[api--operaciones-marcaciones|MarcacionesController]]
- `calls` → [[api--operaciones-marcaciones|MarcacionesController]]
- `calls` → [[api--operaciones-marcaciones|MarcacionesController]]
- `calls` → [[api--operaciones-marcaciones|MarcacionesController]]
- `calls` → [[api--operaciones-marcaciones|MarcacionesController]]
- `calls` → [[api--operaciones-participantes-externos|ParticipantesExternosController]]
- `calls` → [[api--operaciones-participantes-externos|ParticipantesExternosController]]
- `calls` → [[api--operaciones-participantes-externos|ParticipantesExternosController]]
- `calls` → [[api--operaciones-tolerancias|ToleranciasController]]
- `calls` → [[api--operaciones-dashboard-asistencia|DashboardAsistenciaController]]
- `calls` → [[api--operaciones-importaciones|ImportacionesController]]
- `calls` → [[api--operaciones-importaciones|ImportacionesController]]

## Referenciado por

- [[screen--dashboard-academia-id|/dashboard/academia/[id]]] `uses` →
- [[screen--dashboard-asistencia-eventos|/dashboard/asistencia/eventos]] `uses` →
- [[screen--dashboard-asistencia-eventos-id|/dashboard/asistencia/eventos/[id]]] `uses` →
- [[screen--dashboard-asistencia-externos|/dashboard/asistencia/externos]] `uses` →
- [[screen--dashboard-asistencia|/dashboard/asistencia]] `uses` →
- [[screen--dashboard-asistencia-registro|/dashboard/asistencia/registro]] `uses` →
- [[screen--dashboard-asistencia-tolerancias|/dashboard/asistencia/tolerancias]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
