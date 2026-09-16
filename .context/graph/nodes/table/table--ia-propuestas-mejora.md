---
id: table--ia-propuestas-mejora
tipo: TABLE
nombre: ia.propuestas_mejora
nivel: L2
dominio: inteligencia
resumen: Tabla ia.propuestas_mejora (12 columnas). Creada en 057_ia_estructura.sql.
tabla: propuestas_mejora
archivos:
  - database/migrations/057_ia_estructura.sql
edges:
  - [defined_in, file--057-ia-estructura]
  - [belongs_to, domain--inteligencia]
  - [references, table--seguridad-usuarios]
  - [references, table--seguridad-usuarios]
terminos: [propuestas, mejora, institucion, origen, problema, detectado, propuesta, texto, estado, creado, revisado, fecha, revision, motivo, decision, actualizado]
---

# ia.propuestas_mejora

Tabla ia.propuestas_mejora (12 columnas). Creada en 057_ia_estructura.sql.

- **Esquema:** ia · **Columnas:** 12

## Llaves foraneas

- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `revisado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| institucion_id | UNIQUEIDENTIFIER |
| origen | NVARCHAR(10) |
| problema_detectado | NVARCHAR(MAX) |
| propuesta_texto | NVARCHAR(MAX) |
| estado | NVARCHAR(20) |
| creado_por | UNIQUEIDENTIFIER |
| revisado_por | UNIQUEIDENTIFIER |
| fecha_revision | DATETIMEOFFSET(3) |
| motivo_decision | NVARCHAR(500) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** `/dashboard/inteligencia`, `/dashboard/seguridad/inteligencia-artificial`, `/dashboard/seguridad/inteligencia-artificial/auditoria`, `/dashboard/seguridad/inteligencia-artificial/configuracion`, `/dashboard/seguridad/inteligencia-artificial/conversaciones`, `/dashboard/seguridad/inteligencia-artificial/propuestas`
- **Endpoints:** IaChatController, IaConfiguracionController, IaPropuestasMejoraController
- **Servicios:** IaConfiguracionService, IaPropuestasMejoraService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/057_ia_estructura.sql`

## Relaciones

- `defined_in` → [[file--057-ia-estructura|057_ia_estructura.sql]]
- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--ia-propuesta-mejora|PropuestaMejoraIa]] `persisted_in` →
- [[service--ia-ia-configuracion|IaConfiguracionService]] `reads` →
- [[service--ia-ia-propuestas-mejora|IaPropuestasMejoraService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
