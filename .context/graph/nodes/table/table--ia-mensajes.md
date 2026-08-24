---
id: table--ia-mensajes
tipo: TABLE
nombre: ia.mensajes
nivel: L2
dominio: inteligencia
resumen: Tabla ia.mensajes (9 columnas). Creada en 057_ia_estructura.sql, modificada por 060_ia_motor_local.sql.
tabla: mensajes
archivos:
  - database/migrations/057_ia_estructura.sql
  - database/migrations/060_ia_motor_local.sql
edges:
  - [defined_in, file--057-ia-estructura]
  - [belongs_to, domain--inteligencia]
  - [references, table--ia-conversaciones]
terminos: [mensajes, conversacion, rol, contenido, duracion, fuentes, json, resultado, error, detalle, creado]
---

# ia.mensajes

Tabla ia.mensajes (9 columnas). Creada en 057_ia_estructura.sql, modificada por 060_ia_motor_local.sql.

- **Esquema:** ia · **Columnas:** 9

## Llaves foraneas

- `conversacion_id` → [[table--ia-conversaciones|ia.conversaciones]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| conversacion_id | UNIQUEIDENTIFIER |
| rol | NVARCHAR(20) |
| contenido | NVARCHAR(MAX) |
| duracion_ms | INT |
| fuentes_json | NVARCHAR(MAX) |
| resultado | NVARCHAR(20) |
| error_detalle | NVARCHAR(500) |
| creado_en | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** `/dashboard/inteligencia`, `/dashboard/seguridad/inteligencia-artificial`, `/dashboard/seguridad/inteligencia-artificial/auditoria`, `/dashboard/seguridad/inteligencia-artificial/configuracion`, `/dashboard/seguridad/inteligencia-artificial/conversaciones`, `/dashboard/seguridad/inteligencia-artificial/propuestas`
- **Endpoints:** IaAdminConversacionesController, IaChatController, IaConfiguracionController, IaDashboardController
- **Servicios:** IaChatService, IaConfiguracionService, IaConversacionesService, IaDashboardService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/057_ia_estructura.sql`
- `database/migrations/060_ia_motor_local.sql`

## Relaciones

- `defined_in` → [[file--057-ia-estructura|057_ia_estructura.sql]]
- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `references` → [[table--ia-conversaciones|ia.conversaciones]]

## Referenciado por

- [[table--ia-ejecuciones-herramientas|ia.ejecuciones_herramientas]] `references` →
- [[entity--ia-mensaje|MensajeIa]] `persisted_in` →
- [[service--ia-ia-chat|IaChatService]] `reads` →
- [[service--ia-ia-configuracion|IaConfiguracionService]] `reads` →
- [[service--ia-ia-conversaciones|IaConversacionesService]] `reads` →
- [[service--ia-ia-dashboard|IaDashboardService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
