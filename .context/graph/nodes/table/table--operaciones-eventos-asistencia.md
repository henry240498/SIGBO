---
id: table--operaciones-eventos-asistencia
tipo: TABLE
nombre: operaciones.eventos_asistencia
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.eventos_asistencia (14 columnas). Creada en 005_operaciones.sql, modificada por 009_foreign_keys.sql, 020_asistencia.sql, 037_academia_integracion_asistencia_certificaciones.sql.
tabla: eventos_asistencia
archivos:
  - database/migrations/005_operaciones.sql
  - database/migrations/009_foreign_keys.sql
  - database/migrations/020_asistencia.sql
  - database/migrations/037_academia_integracion_asistencia_certificaciones.sql
edges:
  - [defined_in, file--005-operaciones]
  - [belongs_to, domain--asistencia]
terminos: [operaciones, eventos, asistencia, nombre, descripcion, fecha, inicio, fin, ubicacion, responsable, estado, metadata, creado, actualizado, tipo, evento, institucion, actividad, academica]
---

# operaciones.eventos_asistencia

Tabla operaciones.eventos_asistencia (14 columnas). Creada en 005_operaciones.sql, modificada por 009_foreign_keys.sql, 020_asistencia.sql, 037_academia_integracion_asistencia_certificaciones.sql.

- **Esquema:** operaciones · **Columnas:** 14

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| nombre | NVARCHAR(200) |
| descripcion | NVARCHAR(MAX) |
| fecha_inicio | DATETIMEOFFSET(3) |
| fecha_fin | DATETIMEOFFSET(3) |
| ubicacion | NVARCHAR(200) |
| responsable_id | UNIQUEIDENTIFIER |
| estado | NVARCHAR(20) |
| metadata | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| tipo_evento_id | UNIQUEIDENTIFIER |
| institucion_id | UNIQUEIDENTIFIER |
| actividad_academica_id | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/academia/[id]`, `/dashboard/asistencia`, `/dashboard/asistencia/eventos`, `/dashboard/asistencia/eventos/[id]`, `/dashboard/asistencia/externos`, `/dashboard/asistencia/registro`, `/dashboard/asistencia/tolerancias`
- **Endpoints:** BitacoraController, DashboardAsistenciaController, EventosAsistenciaController, MarcacionesController, SesionesAcademiaController
- **Servicios:** BitacoraService, DashboardAsistenciaService, EventosAsistenciaService, SesionesAcademiaService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/005_operaciones.sql`
- `database/migrations/009_foreign_keys.sql`
- `database/migrations/020_asistencia.sql`
- `database/migrations/037_academia_integracion_asistencia_certificaciones.sql`

## Relaciones

- `defined_in` → [[file--005-operaciones|005_operaciones.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]

## Referenciado por

- [[table--operaciones-participantes-evento|operaciones.participantes_evento]] `references` →
- [[entity--evento-asistencia|EventoAsistencia]] `persisted_in` →
- [[service--academia-sesiones-academia|SesionesAcademiaService]] `reads` →
- [[service--guardias-bitacora|BitacoraService]] `reads` →
- [[service--operaciones-dashboard-asistencia|DashboardAsistenciaService]] `reads` →
- [[service--operaciones-eventos-asistencia|EventosAsistenciaService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
