---
id: table--ia-historial-configuracion
tipo: TABLE
nombre: ia.historial_configuracion
nivel: L2
dominio: inteligencia
resumen: Tabla ia.historial_configuracion (8 columnas). Creada en 057_ia_estructura.sql.
tabla: historial_configuracion
archivos:
  - database/migrations/057_ia_estructura.sql
edges:
  - [defined_in, file--057-ia-estructura]
  - [belongs_to, domain--inteligencia]
  - [references, table--ia-configuraciones]
  - [references, table--seguridad-usuarios]
terminos: [historial, configuracion, valor, anterior, json, nuevo, motivo, usuario, creado]
---

# ia.historial_configuracion

Tabla ia.historial_configuracion (8 columnas). Creada en 057_ia_estructura.sql.

- **Esquema:** ia · **Columnas:** 8

## Llaves foraneas

- `configuracion_id` → [[table--ia-configuraciones|ia.configuraciones]]
- `usuario_id` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| configuracion_id | UNIQUEIDENTIFIER |
| valor_anterior_json | NVARCHAR(MAX) |
| valor_nuevo_json | NVARCHAR(MAX) |
| motivo | NVARCHAR(500) |
| usuario_id | UNIQUEIDENTIFIER |
| ip | NVARCHAR(64) |
| creado_en | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** `/dashboard/inteligencia`, `/dashboard/seguridad/inteligencia-artificial`, `/dashboard/seguridad/inteligencia-artificial/auditoria`, `/dashboard/seguridad/inteligencia-artificial/configuracion`, `/dashboard/seguridad/inteligencia-artificial/conversaciones`, `/dashboard/seguridad/inteligencia-artificial/propuestas`
- **Endpoints:** IaChatController, IaConfiguracionController
- **Servicios:** IaConfiguracionService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/057_ia_estructura.sql`

## Relaciones

- `defined_in` → [[file--057-ia-estructura|057_ia_estructura.sql]]
- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `references` → [[table--ia-configuraciones|ia.configuraciones]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--ia-historial-configuracion|HistorialConfiguracionIa]] `persisted_in` →
- [[service--ia-ia-configuracion|IaConfiguracionService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
