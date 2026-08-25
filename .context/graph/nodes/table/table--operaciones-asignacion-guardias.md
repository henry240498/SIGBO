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

## Donde se usa

- **Pantallas:** `/dashboard/academia/[id]`, `/dashboard/asistencia`, `/dashboard/asistencia/eventos`, `/dashboard/asistencia/eventos/[id]`, `/dashboard/asistencia/externos`, `/dashboard/asistencia/registro`, `/dashboard/asistencia/tolerancias`, `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/feriados`, `/dashboard/organizacion/guardias/planificacion`, `/dashboard/personal/[id]`
- **Endpoints:** ConsultasCruzadasController, DashboardAsistenciaController, GuardiasController, OrdenesGuardiaController
- **Servicios:** ConsultasCruzadasService, DashboardAsistenciaService, GeneracionService, GuardiasService, IaToolsService, OrdenesGuardiaService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/005_operaciones.sql`
- `database/migrations/009_foreign_keys.sql`
- `database/migrations/025_guardias.sql`

## Relaciones

- `defined_in` → [[file--005-operaciones|005_operaciones.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]

## Referenciado por

- [[entity--asignacion-guardia|AsignacionGuardia]] `persisted_in` →
- [[service--guardias-generacion|GeneracionService]] `reads` →
- [[service--guardias-guardias|GuardiasService]] `reads` →
- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `reads` →
- [[service--ia-ia-tools|IaToolsService]] `reads` →
- [[service--operaciones-dashboard-asistencia|DashboardAsistenciaService]] `reads` →
- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
