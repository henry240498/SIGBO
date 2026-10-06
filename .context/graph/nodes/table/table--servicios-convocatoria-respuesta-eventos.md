---
id: table--servicios-convocatoria-respuesta-eventos
tipo: TABLE
nombre: servicios.convocatoria_respuesta_eventos
nivel: L2
dominio: servicios
resumen: Tabla servicios.convocatoria_respuesta_eventos (8 columnas). Creada en 089_convocatoria_historial_operativo.sql.
tabla: convocatoria_respuesta_eventos
archivos:
  - database/migrations/089_convocatoria_historial_operativo.sql
edges:
  - [defined_in, file--089-convocatoria-historial-operativo]
  - [belongs_to, domain--servicios]
  - [references, table--servicios-convocatorias]
  - [references, table--seguridad-usuarios]
terminos: [servicios, convocatoria, respuesta, eventos, usuario, nombre, accion, motivo, ocurrido]
---

# servicios.convocatoria_respuesta_eventos

Tabla servicios.convocatoria_respuesta_eventos (8 columnas). Creada en 089_convocatoria_historial_operativo.sql.

- **Esquema:** servicios · **Columnas:** 8

## Restricciones CHECK (reglas que la BD impone)

- `accion IN ( 'ACEPTAR', 'RECHAZAR', 'CAMBIAR_RESPUESTA', 'EN_CAMINO', 'CANCELAR_ASISTENCIA', 'LLEGAR' )`

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
| accion | NVARCHAR(30) |
| respuesta | NVARCHAR(10) |
| motivo | NVARCHAR(500) |
| ocurrido_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/089_convocatoria_historial_operativo.sql`

## Relaciones

- `defined_in` → [[file--089-convocatoria-historial-operativo|089_convocatoria_historial_operativo.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]
- `references` → [[table--servicios-convocatorias|servicios.convocatorias]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
