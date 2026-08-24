---
id: table--ia-configuraciones
tipo: TABLE
nombre: ia.configuraciones
nivel: L2
dominio: inteligencia
resumen: Tabla ia.configuraciones (24 columnas). Creada en 057_ia_estructura.sql, modificada por 060_ia_motor_local.sql, 061_ia_avatar_predefinido.sql, 067_ia_explicar_interpretacion.sql.
tabla: configuraciones
archivos:
  - database/migrations/057_ia_estructura.sql
  - database/migrations/060_ia_motor_local.sql
  - database/migrations/061_ia_avatar_predefinido.sql
  - database/migrations/067_ia_explicar_interpretacion.sql
edges:
  - [defined_in, file--057-ia-estructura]
  - [belongs_to, domain--inteligencia]
  - [references, table--seguridad-usuarios]
terminos: [configuraciones, institucion, nombre, personaje, descripcion, avatar, url, personalidad, saludo, formalidad, permite, emojis, instrucciones, institucionales, estado, motivo, desactivacion, mensaje, mantenimiento, limite, consultas, minuto, hora, modulos, habilitados, json, creado, actualizado, activo, emoji, color, fondo, explicar, interpretacion]
---

# ia.configuraciones

Tabla ia.configuraciones (24 columnas). Creada en 057_ia_estructura.sql, modificada por 060_ia_motor_local.sql, 061_ia_avatar_predefinido.sql, 067_ia_explicar_interpretacion.sql.

- **Esquema:** ia · **Columnas:** 24

## Llaves foraneas

- `actualizado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| institucion_id | UNIQUEIDENTIFIER |
| nombre | NVARCHAR(100) |
| personaje | NVARCHAR(150) |
| descripcion | NVARCHAR(500) |
| avatar_url | NVARCHAR(500) |
| personalidad | NVARCHAR(MAX) |
| saludo | NVARCHAR(500) |
| formalidad | NVARCHAR(10) |
| permite_emojis | BIT |
| instrucciones_institucionales | NVARCHAR(MAX) |
| estado | NVARCHAR(20) |
| motivo_desactivacion | NVARCHAR(500) |
| mensaje_mantenimiento | NVARCHAR(300) |
| limite_consultas_minuto | INT |
| limite_consultas_hora | INT |
| modulos_habilitados_json | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| actualizado_por | UNIQUEIDENTIFIER |
| limite_activo | BIT |
| avatar_emoji | NVARCHAR(20) |
| avatar_color_fondo | NVARCHAR(20) |
| explicar_interpretacion | BIT |

## Donde se usa

- **Pantallas:** `/dashboard/inteligencia`, `/dashboard/seguridad/inteligencia-artificial`, `/dashboard/seguridad/inteligencia-artificial/auditoria`, `/dashboard/seguridad/inteligencia-artificial/configuracion`, `/dashboard/seguridad/inteligencia-artificial/conversaciones`, `/dashboard/seguridad/inteligencia-artificial/propuestas`
- **Endpoints:** IaChatController, IaConfiguracionController
- **Servicios:** IaConfiguracionService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/057_ia_estructura.sql`
- `database/migrations/060_ia_motor_local.sql`
- `database/migrations/061_ia_avatar_predefinido.sql`
- `database/migrations/067_ia_explicar_interpretacion.sql`

## Relaciones

- `defined_in` → [[file--057-ia-estructura|057_ia_estructura.sql]]
- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[table--ia-historial-configuracion|ia.historial_configuracion]] `references` →
- [[entity--ia-configuracion|ConfiguracionIa]] `persisted_in` →
- [[service--ia-ia-configuracion|IaConfiguracionService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
