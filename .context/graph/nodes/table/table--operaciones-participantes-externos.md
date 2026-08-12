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

## Archivos

- `database/migrations/020_asistencia.sql`

## Relaciones

- `defined_in` → [[file--020-asistencia|020_asistencia.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]

## Referenciado por

- [[table--operaciones-participantes-evento|operaciones.participantes_evento]] `references` →
- [[entity--participante-externo|ParticipanteExterno]] `persisted_in` →
- [[service--operaciones-eventos-asistencia|EventosAsistenciaService]] `reads` →
- [[service--operaciones-participantes-externos|ParticipantesExternosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
