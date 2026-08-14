---
id: table--seguridad-logs-auditoria
tipo: TABLE
nombre: seguridad.logs_auditoria
nivel: L2
dominio: seguridad
resumen: Tabla seguridad.logs_auditoria (11 columnas). Creada en 002_seguridad.sql, modificada por 009_foreign_keys.sql.
tabla: logs_auditoria
archivos:
  - database/migrations/002_seguridad.sql
  - database/migrations/009_foreign_keys.sql
edges:
  - [defined_in, file--002-seguridad]
  - [belongs_to, domain--seguridad]
terminos: [seguridad, logs, auditoria, usuario, accion, recurso, user, agent, datos, antes, despues, metadata, fecha]
---

# seguridad.logs_auditoria

Tabla seguridad.logs_auditoria (11 columnas). Creada en 002_seguridad.sql, modificada por 009_foreign_keys.sql.

- **Esquema:** seguridad · **Columnas:** 11

## Columnas

| Columna | Tipo |
|---|---|
| id | BIGINT |
| usuario_id | UNIQUEIDENTIFIER |
| accion | NVARCHAR(100) |
| recurso | NVARCHAR(100) |
| recurso_id | UNIQUEIDENTIFIER |
| ip | VARCHAR(45) |
| user_agent | NVARCHAR(MAX) |
| datos_antes | NVARCHAR(MAX) |
| datos_despues | NVARCHAR(MAX) |
| metadata | NVARCHAR(MAX) |
| fecha | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** `/dashboard/asistencia/auditoria`, `/dashboard/guardias/auditoria`, `/dashboard/mi-perfil/seguridad`, `/dashboard/personal/[id]`, `/dashboard/seguridad/auditoria`, `/dashboard/seguridad/sesiones`, `/dashboard/seguridad/usuarios/[id]`, `/dashboard/servicios`, `/dashboard/servicios/nuevo`
- **Endpoints:** AuditoriaController, ServiciosController, SesionesController
- **Servicios:** AuditoriaService, ServiciosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/002_seguridad.sql`
- `database/migrations/009_foreign_keys.sql`

## Relaciones

- `defined_in` → [[file--002-seguridad|002_seguridad.sql]]
- `belongs_to` → [[domain--seguridad|Seguridad]]

## Referenciado por

- [[entity--log-auditoria|LogAuditoria]] `persisted_in` →
- [[service--seguridad-auditoria|AuditoriaService]] `reads` →
- [[service--servicios-servicios|ServiciosService]] `reads` →
- [[rule--espanol-y-auditoria|Todo en espanol, y las acciones sensibles quedan auditadas]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
