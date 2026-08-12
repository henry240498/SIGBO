---
id: table--operaciones-participantes-evento
tipo: TABLE
nombre: operaciones.participantes_evento
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.participantes_evento (17 columnas). Creada en 020_asistencia.sql.
tabla: participantes_evento
archivos:
  - database/migrations/020_asistencia.sql
edges:
  - [defined_in, file--020-asistencia]
  - [belongs_to, domain--asistencia]
  - [references, table--operaciones-eventos-asistencia]
  - [references, table--personal-bomberos]
  - [references, table--operaciones-participantes-externos]
terminos: [operaciones, participantes, evento, bombero, participante, externo, hora, real, inicio, fin, duracion, minutos, then, porcentaje, participacion, estado, fuente, registrado, observacion, institucion, creado, actualizado]
---

# operaciones.participantes_evento

Tabla operaciones.participantes_evento (17 columnas). Creada en 020_asistencia.sql.

- **Esquema:** operaciones · **Columnas:** 17
- **UNIQUE:** `evento_id, participante_id`

## Restricciones CHECK (reglas que la BD impone)

- `estado_participacion IN ('COMPLETA','PARCIAL','NO_REGISTRADA','AUSENTE_CONFIRMADO')), CONSTRAINT CK_partev_fuente CHECK (fuente IN ('MARCADOR_DIGITAL','MANUAL','IMPORTACION_EXCEL','EVENTO','GUARDIA','OTRO')), CONSTRAINT CK_partev_participante CHECK ( (bombero_id IS NOT NULL AND participante_externo_id IS NULL) OR (bombero_id IS NULL AND participante_externo_id IS NOT NULL`

## Llaves foraneas

- `evento_id` → [[table--operaciones-eventos-asistencia|operaciones.eventos_asistencia]]
- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]
- `participante_externo_id` → [[table--operaciones-participantes-externos|operaciones.participantes_externos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| evento_id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| participante_externo_id | UNIQUEIDENTIFIER |
| participante_id | AS |
| hora_real_inicio | DATETIMEOFFSET(3) |
| hora_real_fin | DATETIMEOFFSET(3) |
| duracion_minutos | AS |
| THEN | DATEDIFF(MINUTE, hora_real_inicio, hora_real_fin) |
| porcentaje_participacion | DECIMAL(5,2) |
| estado_participacion | NVARCHAR(20) |
| fuente | NVARCHAR(30) |
| registrado_por | UNIQUEIDENTIFIER |
| observacion | NVARCHAR(MAX) |
| institucion_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |

## Archivos

- `database/migrations/020_asistencia.sql`

## Relaciones

- `defined_in` → [[file--020-asistencia|020_asistencia.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]
- `references` → [[table--operaciones-eventos-asistencia|operaciones.eventos_asistencia]]
- `references` → [[table--personal-bomberos|personal.bomberos]]
- `references` → [[table--operaciones-participantes-externos|operaciones.participantes_externos]]

## Referenciado por

- [[entity--participante-evento|ParticipanteEvento]] `persisted_in` →
- [[service--operaciones-dashboard-asistencia|DashboardAsistenciaService]] `reads` →
- [[service--operaciones-eventos-asistencia|EventosAsistenciaService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
