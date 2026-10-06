---
id: table--servicios-formulario-historial
tipo: TABLE
nombre: servicios.formulario_historial
nivel: L2
dominio: servicios
resumen: Tabla servicios.formulario_historial (11 columnas). Creada en 090_despacho_servicio_seguridad.sql.
tabla: formulario_historial
archivos:
  - database/migrations/090_despacho_servicio_seguridad.sql
edges:
  - [defined_in, file--090-despacho-servicio-seguridad]
  - [belongs_to, domain--servicios]
  - [references, table--servicios-formulario-respuestas]
terminos: [servicios, formulario, historial, respuesta, usuario, nombre, accion, datos, antes, despues, estado, ocurrido, registrado]
---

# servicios.formulario_historial

Tabla servicios.formulario_historial (11 columnas). Creada en 090_despacho_servicio_seguridad.sql.

- **Esquema:** servicios · **Columnas:** 11

## Restricciones CHECK (reglas que la BD impone)

- `accion IN ('CREAR', 'MODIFICAR', 'COMPLETAR', 'ANULAR')`

## Llaves foraneas

- `respuesta_id` → [[table--servicios-formulario-respuestas|servicios.formulario_respuestas]]

## Columnas

| Columna | Tipo |
|---|---|
| id | BIGINT |
| respuesta_id | UNIQUEIDENTIFIER |
| usuario_id | UNIQUEIDENTIFIER |
| usuario_nombre | NVARCHAR(120) |
| accion | NVARCHAR(20) |
| datos_antes | NVARCHAR(MAX) |
| datos_despues | NVARCHAR(MAX) |
| estado_antes | NVARCHAR(20) |
| estado_despues | NVARCHAR(20) |
| ocurrido_en | DATETIMEOFFSET(3) |
| registrado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/090_despacho_servicio_seguridad.sql`

## Relaciones

- `defined_in` → [[file--090-despacho-servicio-seguridad|090_despacho_servicio_seguridad.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]
- `references` → [[table--servicios-formulario-respuestas|servicios.formulario_respuestas]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
