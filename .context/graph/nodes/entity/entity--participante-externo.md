---
id: entity--participante-externo
tipo: ENTITY
nombre: ParticipanteExterno
nivel: L1
dominio: asistencia
resumen: Persona que participa de un evento sin pertenecer al cuerpo de bomberos (civiles, estudiantes, invitados, personal de otras instituciones, etc.). Nunca genera automaticamente un registro en personal.bomberos.
tabla: operaciones.participantes_externos
archivos:
  - backend/src/shared/entities/participante-externo.entity.ts
edges:
  - [belongs_to, domain--asistencia]
  - [persisted_in, table--operaciones-participantes-externos]
terminos: [participante, externo, participantes, externos, operaciones]
---

# ParticipanteExterno

Persona que participa de un evento sin pertenecer al cuerpo de bomberos (civiles, estudiantes, invitados, personal de otras instituciones, etc.). Nunca genera automaticamente un registro en personal.bomberos.

- **Tabla:** [[table--operaciones-participantes-externos|operaciones.participantes_externos]]
- **Columnas mapeadas:** 8

## Donde se usa

- **Pantallas:** `/dashboard/academia`, `/dashboard/academia/[id]`, `/dashboard/academia/cursos-externos`, `/dashboard/academia/instructores-externos`, `/dashboard/asistencia`, `/dashboard/asistencia/eventos`, `/dashboard/asistencia/eventos/[id]`, `/dashboard/asistencia/externos`, `/dashboard/asistencia/registro`, `/dashboard/asistencia/tolerancias`, `/dashboard/finanzas/beneficios`, `/dashboard/personal/[id]`
- **Endpoints:** EvaluacionesAcademiaController, EventosAsistenciaController, InscripcionesAcademiaController, MarcacionesController, ParticipantesExternosController
- **Servicios:** EvaluacionesAcademiaService, EventosAsistenciaService, InscripcionesAcademiaService, ParticipantesExternosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/participante-externo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-participantes-externos|operaciones.participantes_externos]]

## Referenciado por

- [[service--academia-evaluaciones-academia|EvaluacionesAcademiaService]] `uses` →
- [[service--academia-inscripciones-academia|InscripcionesAcademiaService]] `uses` →
- [[service--operaciones-eventos-asistencia|EventosAsistenciaService]] `uses` →
- [[service--operaciones-participantes-externos|ParticipantesExternosService]] `uses` →
- [[workflow--asistencia-a-evento|Evento de asistencia, participantes y marcaciones]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
