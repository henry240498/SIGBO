---
id: entity--participante-evento
tipo: ENTITY
nombre: ParticipanteEvento
nivel: L1
dominio: asistencia
resumen: "Asistencia de una persona (bombero o externo) A un evento -- distinta de la marcacion fisica de entrada/salida del cuartel. Exactamente uno de `bomberoId`/`participanteExternoId` debe estar presente (misma logica que academia.inscripciones_cursos). `estadoParticipacion` nunca se asume AUSENTE_CONFIRMADO automaticamente por falta de marcacion: solo se llega a ese estado por confirmacion explicita de un responsable."
tabla: operaciones.participantes_evento
archivos:
  - backend/src/shared/entities/participante-evento.entity.ts
edges:
  - [belongs_to, domain--asistencia]
  - [persisted_in, table--operaciones-participantes-evento]
terminos: [participante, evento, participantes, operaciones, estado, participacion, completa, parcial, registrada, ausente, confirmado]
---

# ParticipanteEvento

Asistencia de una persona (bombero o externo) A un evento -- distinta de la marcacion fisica de entrada/salida del cuartel. Exactamente uno de `bomberoId`/`participanteExternoId` debe estar presente (misma logica que academia.inscripciones_cursos). `estadoParticipacion` nunca se asume AUSENTE_CONFIRMADO automaticamente por falta de marcacion: solo se llega a ese estado por confirmacion explicita de un responsable.

- **Tabla:** [[table--operaciones-participantes-evento|operaciones.participantes_evento]]
- **Columnas mapeadas:** 13

## Estados y enumeraciones

- `EstadoParticipacion`: `COMPLETA` · `PARCIAL` · `NO_REGISTRADA` · `AUSENTE_CONFIRMADO`

## Archivos

- `backend/src/shared/entities/participante-evento.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-participantes-evento|operaciones.participantes_evento]]

## Referenciado por

- [[service--operaciones-dashboard-asistencia|DashboardAsistenciaService]] `uses` →
- [[service--operaciones-eventos-asistencia|EventosAsistenciaService]] `uses` →
- [[workflow--asistencia-a-evento|Evento de asistencia, participantes y marcaciones]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
