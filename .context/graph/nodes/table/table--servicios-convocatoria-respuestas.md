---
id: table--servicios-convocatoria-respuestas
tipo: TABLE
nombre: servicios.convocatoria_respuestas
nivel: L2
dominio: servicios
resumen: Tabla servicios.convocatoria_respuestas (10 columnas). Creada en 079_llamados_convocatorias.sql, modificada por 089_convocatoria_historial_operativo.sql.
tabla: convocatoria_respuestas
archivos:
  - database/migrations/079_llamados_convocatorias.sql
  - database/migrations/089_convocatoria_historial_operativo.sql
edges:
  - [defined_in, file--079-llamados-convocatorias]
  - [belongs_to, domain--servicios]
  - [references, table--servicios-convocatorias]
  - [references, table--seguridad-usuarios]
terminos: [servicios, convocatoria, respuestas, usuario, nombre, respuesta, eta, minutos, respondido, motivo, camino, cancelada]
---

# servicios.convocatoria_respuestas

Tabla servicios.convocatoria_respuestas (10 columnas). Creada en 079_llamados_convocatorias.sql, modificada por 089_convocatoria_historial_operativo.sql.

- **Esquema:** servicios · **Columnas:** 10
- **UNIQUE:** `convocatoria_id, usuario_id`

## Restricciones CHECK (reglas que la BD impone)

- `respuesta IN ('VOY', 'NO_PUEDO')`
- `eta_minutos IS NULL OR (eta_minutos BETWEEN 0 AND 600)`

## Llaves foraneas

- `convocatoria_id` → [[table--servicios-convocatorias|servicios.convocatorias]]
- `usuario_id` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| convocatoria_id | UNIQUEIDENTIFIER |
| usuario_id | UNIQUEIDENTIFIER |
| usuario_nombre | NVARCHAR(200) |
| respuesta | NVARCHAR(10) |
| eta_minutos | INT |
| respondido_en | DATETIMEOFFSET(3) |
| motivo | NVARCHAR(500) |
| en_camino_en | DATETIMEOFFSET(3) |
| cancelada_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/079_llamados_convocatorias.sql`
- `database/migrations/089_convocatoria_historial_operativo.sql`

## Relaciones

- `defined_in` → [[file--079-llamados-convocatorias|079_llamados_convocatorias.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]
- `references` → [[table--servicios-convocatorias|servicios.convocatorias]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
