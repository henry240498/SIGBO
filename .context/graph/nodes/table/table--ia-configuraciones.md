---
id: table--ia-configuraciones
tipo: TABLE
nombre: ia.configuraciones
nivel: L2
dominio: inteligencia
resumen: Tabla ia.configuraciones (43 columnas). Creada en 057_ia_estructura.sql, modificada por 060_ia_motor_local.sql, 061_ia_avatar_predefinido.sql, 067_ia_explicar_interpretacion.sql, 072_ia_ollama_motor_local.sql, 073_ia_voz_local.sql.
tabla: configuraciones
archivos:
  - database/migrations/057_ia_estructura.sql
  - database/migrations/060_ia_motor_local.sql
  - database/migrations/061_ia_avatar_predefinido.sql
  - database/migrations/067_ia_explicar_interpretacion.sql
  - database/migrations/072_ia_ollama_motor_local.sql
  - database/migrations/073_ia_voz_local.sql
edges:
  - [defined_in, file--057-ia-estructura]
  - [belongs_to, domain--inteligencia]
  - [references, table--seguridad-usuarios]
terminos: [configuraciones, institucion, nombre, personaje, descripcion, avatar, url, personalidad, saludo, formalidad, permite, emojis, instrucciones, institucionales, estado, motivo, desactivacion, mensaje, mantenimiento, limite, consultas, minuto, hora, modulos, habilitados, json, creado, actualizado, activo, emoji, color, fondo, explicar, interpretacion, ollama, habilitado, puerto, modelo, timeout, temperatura]
---

# ia.configuraciones

Tabla ia.configuraciones (43 columnas). Creada en 057_ia_estructura.sql, modificada por 060_ia_motor_local.sql, 061_ia_avatar_predefinido.sql, 067_ia_explicar_interpretacion.sql, 072_ia_ollama_motor_local.sql, 073_ia_voz_local.sql.

- **Esquema:** ia · **Columnas:** 43

## Restricciones CHECK (reglas que la BD impone)

- `ollama_puerto BETWEEN 1 AND 65535`
- `ollama_timeout_ms BETWEEN 500 AND 120000`
- `ollama_temperatura BETWEEN 0 AND 1`
- `voz_volumen BETWEEN 0 AND 1`
- `voz_velocidad BETWEEN 0.5 AND 2.0`
- `whisper_puerto BETWEEN 1 AND 65535`
- `whisper_timeout_ms BETWEEN 500 AND 120000`
- `piper_timeout_ms BETWEEN 500 AND 120000`

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
| ollama_habilitado | BIT |
| ollama_url | NVARCHAR(200) |
| ollama_puerto | INT |
| ollama_modelo | NVARCHAR(100) |
| ollama_timeout_ms | INT |
| ollama_temperatura | DECIMAL(3,2) |
| voz_habilitada | BIT |
| entrada_voz_habilitada | BIT |
| respuesta_voz_habilitada | BIT |
| voz_volumen | DECIMAL(3,2) |
| voz_velocidad | DECIMAL(3,2) |
| voz_seleccionada | NVARCHAR(150) |
| voz_idioma | NVARCHAR(10) |
| whisper_url | NVARCHAR(200) |
| whisper_puerto | INT |
| whisper_timeout_ms | INT |
| piper_ruta_binario | NVARCHAR(400) |
| piper_ruta_voz | NVARCHAR(400) |
| piper_timeout_ms | INT |

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
- `database/migrations/072_ia_ollama_motor_local.sql`
- `database/migrations/073_ia_voz_local.sql`

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
