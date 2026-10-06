---
id: table--servicios-formulario-respuestas
tipo: TABLE
nombre: servicios.formulario_respuestas
nivel: L2
dominio: servicios
resumen: Tabla servicios.formulario_respuestas (11 columnas). Creada en 090_despacho_servicio_seguridad.sql.
tabla: formulario_respuestas
archivos:
  - database/migrations/090_despacho_servicio_seguridad.sql
edges:
  - [defined_in, file--090-despacho-servicio-seguridad]
  - [belongs_to, domain--servicios]
  - [references, table--servicios-servicios]
  - [references, table--servicios-formulario-definiciones]
terminos: [servicios, formulario, respuestas, servicio, definicion, version, estado, datos, creado, nombre, actualizado]
---

# servicios.formulario_respuestas

Tabla servicios.formulario_respuestas (11 columnas). Creada en 090_despacho_servicio_seguridad.sql.

- **Esquema:** servicios · **Columnas:** 11

## Restricciones CHECK (reglas que la BD impone)

- `estado IN ('BORRADOR', 'COMPLETADO', 'ANULADO')`

## Llaves foraneas

- `servicio_id` → [[table--servicios-servicios|servicios.servicios]]
- `definicion_id` → [[table--servicios-formulario-definiciones|servicios.formulario_definiciones]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| servicio_id | UNIQUEIDENTIFIER |
| definicion_id | UNIQUEIDENTIFIER |
| definicion_version | INT |
| estado | NVARCHAR(20) |
| datos | NVARCHAR(MAX) |
| creado_por | UNIQUEIDENTIFIER |
| creado_por_nombre | NVARCHAR(120) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| version | INT |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/090_despacho_servicio_seguridad.sql`

## Relaciones

- `defined_in` → [[file--090-despacho-servicio-seguridad|090_despacho_servicio_seguridad.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]
- `references` → [[table--servicios-servicios|servicios.servicios]]
- `references` → [[table--servicios-formulario-definiciones|servicios.formulario_definiciones]]

## Referenciado por

- [[table--servicios-formulario-historial|servicios.formulario_historial]] `references` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
