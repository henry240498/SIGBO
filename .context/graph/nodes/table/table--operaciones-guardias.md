---
id: table--operaciones-guardias
tipo: TABLE
nombre: operaciones.guardias
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.guardias (19 columnas). Creada en 005_operaciones.sql, modificada por 009_foreign_keys.sql, 020_asistencia.sql, 025_guardias.sql, 026_guardias_planificacion.sql.
tabla: guardias
archivos:
  - database/migrations/005_operaciones.sql
  - database/migrations/009_foreign_keys.sql
  - database/migrations/020_asistencia.sql
  - database/migrations/025_guardias.sql
  - database/migrations/026_guardias_planificacion.sql
edges:
  - [defined_in, file--005-operaciones]
  - [belongs_to, domain--asistencia]
terminos: [operaciones, guardias, fecha, turno, hora, inicio, fin, tipo, estado, jefe, guardia, observaciones, creado, actualizado, institucion, grupo, cierre, responsable, observacion, resumen, cerrada, esquema, horario, feriado]
---

# operaciones.guardias

Tabla operaciones.guardias (19 columnas). Creada en 005_operaciones.sql, modificada por 009_foreign_keys.sql, 020_asistencia.sql, 025_guardias.sql, 026_guardias_planificacion.sql.

- **Esquema:** operaciones · **Columnas:** 19

## Restricciones CHECK (reglas que la BD impone)

- `cierre_resumen IS NULL OR ISJSON(cierre_resumen) = 1`
- `estado IN ('PLANIFICADA','CONFIRMADA','EN_CURSO','FINALIZADA','CANCELADA','ANULADA')`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| fecha | DATE |
| turno | NVARCHAR(20) |
| hora_inicio | TIME(0) |
| hora_fin | TIME(0) |
| tipo | NVARCHAR(20) |
| estado | NVARCHAR(20) |
| jefe_guardia_id | UNIQUEIDENTIFIER |
| observaciones | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| institucion_id | UNIQUEIDENTIFIER |
| grupo_guardia_id | UNIQUEIDENTIFIER |
| cierre_responsable_id | UNIQUEIDENTIFIER |
| cierre_observacion | NVARCHAR(MAX) |
| cierre_resumen | NVARCHAR(MAX) |
| cerrada_en | DATETIMEOFFSET(3) |
| esquema_horario_id | UNIQUEIDENTIFIER |
| feriado_id | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/asistencia`, `/dashboard/asistencia/eventos`, `/dashboard/asistencia/eventos/[id]`, `/dashboard/asistencia/externos`, `/dashboard/asistencia/registro`, `/dashboard/asistencia/tolerancias`, `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/feriados`, `/dashboard/personal/[id]`
- **Endpoints:** BitacoraController, ConsultasCruzadasController, DashboardAsistenciaController, FeriadosController, GruposGuardiaController, GuardiasController, InspeccionesEstacionController, InspeccionesMovilController, NovedadesController, OrdenesGuardiaController
- **Servicios:** BitacoraService, ConsultasCruzadasService, DashboardAsistenciaService, FeriadosService, GeneracionService, GruposGuardiaService, GuardiasService, InspeccionesEstacionService, InspeccionesMovilService, NovedadesService, OrdenesGuardiaService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/005_operaciones.sql`
- `database/migrations/009_foreign_keys.sql`
- `database/migrations/020_asistencia.sql`
- `database/migrations/025_guardias.sql`
- `database/migrations/026_guardias_planificacion.sql`

## Relaciones

- `defined_in` → [[file--005-operaciones|005_operaciones.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]

## Referenciado por

- [[table--operaciones-pernoctes|operaciones.pernoctes]] `references` →
- [[table--operaciones-inspecciones-estacion|operaciones.inspecciones_estacion]] `references` →
- [[table--operaciones-novedades-guardia|operaciones.novedades_guardia]] `references` →
- [[table--operaciones-sorteos-guardia|operaciones.sorteos_guardia]] `references` →
- [[table--operaciones-inspecciones-movil|operaciones.inspecciones_movil]] `references` →
- [[entity--guardia|Guardia]] `persisted_in` →
- [[service--guardias-bitacora|BitacoraService]] `reads` →
- [[service--guardias-generacion|GeneracionService]] `reads` →
- [[service--guardias-grupos-guardia|GruposGuardiaService]] `reads` →
- [[service--guardias-guardias|GuardiasService]] `reads` →
- [[service--guardias-inspecciones-estacion|InspeccionesEstacionService]] `reads` →
- [[service--guardias-inspecciones-movil|InspeccionesMovilService]] `reads` →
- [[service--guardias-novedades|NovedadesService]] `reads` →
- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `reads` →
- [[service--operaciones-dashboard-asistencia|DashboardAsistenciaService]] `reads` →
- [[service--organizacion-feriados|FeriadosService]] `reads` →
- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
