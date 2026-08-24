---
id: table--ia-conversaciones
tipo: TABLE
nombre: ia.conversaciones
nivel: L2
dominio: inteligencia
resumen: Tabla ia.conversaciones (10 columnas). Creada en 057_ia_estructura.sql, modificada por 060_ia_motor_local.sql.
tabla: conversaciones
archivos:
  - database/migrations/057_ia_estructura.sql
  - database/migrations/060_ia_motor_local.sql
edges:
  - [defined_in, file--057-ia-estructura]
  - [belongs_to, domain--inteligencia]
  - [references, table--seguridad-usuarios]
terminos: [conversaciones, institucion, usuario, titulo, estado, user, agent, iniciada, ultima, actividad, ultimo, contexto, json]
---

# ia.conversaciones

Tabla ia.conversaciones (10 columnas). Creada en 057_ia_estructura.sql, modificada por 060_ia_motor_local.sql.

- **Esquema:** ia · **Columnas:** 10

## Llaves foraneas

- `usuario_id` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| institucion_id | UNIQUEIDENTIFIER |
| usuario_id | UNIQUEIDENTIFIER |
| titulo | NVARCHAR(200) |
| estado | NVARCHAR(20) |
| ip | NVARCHAR(64) |
| user_agent | NVARCHAR(300) |
| iniciada_en | DATETIMEOFFSET(3) |
| ultima_actividad_en | DATETIMEOFFSET(3) |
| ultimo_contexto_json | NVARCHAR(MAX) |

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
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[table--ia-mensajes|ia.mensajes]] `references` →
- [[table--ia-ejecuciones-herramientas|ia.ejecuciones_herramientas]] `references` →
- [[entity--ia-conversacion|ConversacionIa]] `persisted_in` →
- [[service--ia-ia-chat|IaChatService]] `reads` →
- [[service--ia-ia-configuracion|IaConfiguracionService]] `reads` →
- [[service--ia-ia-conversaciones|IaConversacionesService]] `reads` →
- [[service--ia-ia-dashboard|IaDashboardService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
