---
id: table--operaciones-asignacion-guardias
tipo: TABLE
nombre: operaciones.asignacion_guardias
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.asignacion_guardias (14 columnas). Creada en 005_operaciones.sql, modificada por 009_foreign_keys.sql, 025_guardias.sql.
tabla: asignacion_guardias
archivos:
  - database/migrations/005_operaciones.sql
  - database/migrations/009_foreign_keys.sql
  - database/migrations/025_guardias.sql
edges:
  - [defined_in, file--005-operaciones]
  - [belongs_to, domain--asistencia]
terminos: [operaciones, asignacion, guardias, guardia, bombero, rol, estado, fecha, asignado, observaciones, tipo, participacion, reemplaza, hora, entrada, salida, presencia, motivo]
---

# operaciones.asignacion_guardias

Tabla operaciones.asignacion_guardias (14 columnas). Creada en 005_operaciones.sql, modificada por 009_foreign_keys.sql, 025_guardias.sql.

- **Esquema:** operaciones · **Columnas:** 14
- **UNIQUE:** `guardia_id, bombero_id`

## Restricciones CHECK (reglas que la BD impone)

- `tipo_participacion IN ('TITULAR','REFUERZO','REEMPLAZO')`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| guardia_id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| rol | NVARCHAR(50) |
| estado | NVARCHAR(20) |
| fecha_asignacion | DATETIMEOFFSET(3) |
| asignado_por | UNIQUEIDENTIFIER |
| observaciones | NVARCHAR(MAX) |
| tipo_participacion | NVARCHAR(20) |
| reemplaza_asignacion_id | UNIQUEIDENTIFIER |
| hora_entrada | DATETIMEOFFSET(3) |
| hora_salida | DATETIMEOFFSET(3) |
| estado_presencia | NVARCHAR(30) |
| motivo | NVARCHAR(MAX) |

## Archivos

- `database/migrations/005_operaciones.sql`
- `database/migrations/009_foreign_keys.sql`
- `database/migrations/025_guardias.sql`

## Relaciones

- `defined_in` → [[file--005-operaciones|005_operaciones.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]

## Referenciado por

- [[entity--asignacion-guardia|AsignacionGuardia]] `persisted_in` →
- [[service--guardias-guardias|GuardiasService]] `reads` →
- [[service--operaciones-dashboard-asistencia|DashboardAsistenciaService]] `reads` →
- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
