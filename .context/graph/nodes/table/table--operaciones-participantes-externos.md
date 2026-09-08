---
id: table--operaciones-participantes-externos
tipo: TABLE
nombre: operaciones.participantes_externos
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.participantes_externos (10 columnas). Creada en 020_asistencia.sql.
tabla: participantes_externos
archivos:
  - database/migrations/020_asistencia.sql
edges:
  - [defined_in, file--020-asistencia]
  - [belongs_to, domain--asistencia]
terminos: [operaciones, participantes, externos, cedula, nombre, apellido, celular, institucion, procedencia, observacion, creado]
---

# operaciones.participantes_externos

Tabla operaciones.participantes_externos (10 columnas). Creada en 020_asistencia.sql.

- **Esquema:** operaciones · **Columnas:** 10

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| cedula | NVARCHAR(20) |
| nombre | NVARCHAR(100) |
| apellido | NVARCHAR(100) |
| celular | NVARCHAR(20) |
| institucion_procedencia | NVARCHAR(150) |
| observacion | NVARCHAR(MAX) |
| institucion_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/academia`, `/dashboard/academia/[id]`, `/dashboard/academia/cursos-externos`, `/dashboard/academia/instructores-externos`, `/dashboard/asistencia`, `/dashboard/asistencia/eventos`, `/dashboard/asistencia/eventos/[id]`, `/dashboard/asistencia/externos`, `/dashboard/asistencia/registro`, `/dashboard/asistencia/tolerancias`, `/dashboard/finanzas/beneficios`
- **Endpoints:** EvaluacionesAcademiaController, EventosAsistenciaController, InscripcionesAcademiaController, MarcacionesController, ParticipantesExternosController
- **Servicios:** EvaluacionesAcademiaService, EventosAsistenciaService, InscripcionesAcademiaService, ParticipantesExternosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/020_asistencia.sql`

## Relaciones

- `defined_in` → [[file--020-asistencia|020_asistencia.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]

## Referenciado por

- [[table--operaciones-participantes-evento|operaciones.participantes_evento]] `references` →
- [[table--academia-inscripciones|academia.inscripciones]] `references` →
- [[entity--participante-externo|ParticipanteExterno]] `persisted_in` →
- [[service--academia-evaluaciones-academia|EvaluacionesAcademiaService]] `reads` →
- [[service--academia-inscripciones-academia|InscripcionesAcademiaService]] `reads` →
- [[service--operaciones-eventos-asistencia|EventosAsistenciaService]] `reads` →
- [[service--operaciones-participantes-externos|ParticipantesExternosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
