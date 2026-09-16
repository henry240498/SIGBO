---
id: table--ia-ejecuciones-herramientas
tipo: TABLE
nombre: ia.ejecuciones_herramientas
nivel: L2
dominio: inteligencia
resumen: Tabla ia.ejecuciones_herramientas (12 columnas). Creada en 057_ia_estructura.sql.
tabla: ejecuciones_herramientas
archivos:
  - database/migrations/057_ia_estructura.sql
edges:
  - [defined_in, file--057-ia-estructura]
  - [belongs_to, domain--inteligencia]
  - [references, table--ia-mensajes]
  - [references, table--ia-conversaciones]
  - [references, table--seguridad-usuarios]
terminos: [ejecuciones, herramientas, mensaje, conversacion, usuario, herramienta, argumentos, json, permiso, evaluado, resultado, datos, consultados, resumen, error, detalle, duracion, creado]
---

# ia.ejecuciones_herramientas

Tabla ia.ejecuciones_herramientas (12 columnas). Creada en 057_ia_estructura.sql.

- **Esquema:** ia · **Columnas:** 12

## Llaves foraneas

- `mensaje_id` → [[table--ia-mensajes|ia.mensajes]]
- `conversacion_id` → [[table--ia-conversaciones|ia.conversaciones]]
- `usuario_id` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| mensaje_id | UNIQUEIDENTIFIER |
| conversacion_id | UNIQUEIDENTIFIER |
| usuario_id | UNIQUEIDENTIFIER |
| herramienta | NVARCHAR(60) |
| argumentos_json | NVARCHAR(MAX) |
| permiso_evaluado | NVARCHAR(60) |
| resultado | NVARCHAR(20) |
| datos_consultados_resumen | NVARCHAR(300) |
| error_detalle | NVARCHAR(500) |
| duracion_ms | INT |
| creado_en | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** `/dashboard/inteligencia`, `/dashboard/seguridad/inteligencia-artificial`, `/dashboard/seguridad/inteligencia-artificial/auditoria`, `/dashboard/seguridad/inteligencia-artificial/configuracion`, `/dashboard/seguridad/inteligencia-artificial/conversaciones`, `/dashboard/seguridad/inteligencia-artificial/propuestas`
- **Endpoints:** IaAdminConversacionesController, IaChatController, IaConfiguracionController, IaDashboardController
- **Servicios:** IaChatService, IaConfiguracionService, IaConversacionesService, IaDashboardService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/057_ia_estructura.sql`

## Relaciones

- `defined_in` → [[file--057-ia-estructura|057_ia_estructura.sql]]
- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `references` → [[table--ia-mensajes|ia.mensajes]]
- `references` → [[table--ia-conversaciones|ia.conversaciones]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--ia-ejecucion-herramienta|EjecucionHerramientaIa]] `persisted_in` →
- [[service--ia-ia-chat|IaChatService]] `reads` →
- [[service--ia-ia-configuracion|IaConfiguracionService]] `reads` →
- [[service--ia-ia-conversaciones|IaConversacionesService]] `reads` →
- [[service--ia-ia-dashboard|IaDashboardService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
