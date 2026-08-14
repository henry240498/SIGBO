---
id: component--modulo-operaciones
tipo: COMPONENT
nombre: operaciones (modulo NestJS)
nivel: L1
dominio: asistencia
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de operaciones.
capa: backend
archivos:
  - backend/src/modules/operaciones/operaciones.module.ts
edges:
  - [belongs_to, domain--asistencia]
terminos: [operaciones, modulo]
---

# operaciones (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de operaciones.


## Entidades registradas (forFeature)

<<<<<<< Updated upstream
EventoAsistencia, MarcacionAsistencia, ParticipanteEvento, ParticipanteExterno, ToleranciaAsistencia, ImportacionMarcador, ImportacionMarcadorFila, Guardia, AsignacionGuardia, Bombero, Parametro
=======
EventoAsistencia, MarcacionAsistencia, ParticipanteEvento, ParticipanteExterno, CambioGuardia, ToleranciaAsistencia, ImportacionMarcador, ImportacionMarcadorFila, Guardia, AsignacionGuardia, Bombero, Parametro
>>>>>>> Stashed changes

## Archivos

- `backend/src/modules/operaciones/operaciones.module.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]

## Referenciado por

- [[service--operaciones-dashboard-asistencia|DashboardAsistenciaService]] `uses` →
- [[service--operaciones-eventos-asistencia|EventosAsistenciaService]] `uses` →
<<<<<<< Updated upstream
=======
- [[service--operaciones-guardias|GuardiasService]] `uses` →
>>>>>>> Stashed changes
- [[service--operaciones-importaciones|ImportacionesService]] `uses` →
- [[service--operaciones-marcaciones|MarcacionesService]] `uses` →
- [[service--operaciones-participantes-externos|ParticipantesExternosService]] `uses` →
- [[service--operaciones-tolerancias|ToleranciasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
