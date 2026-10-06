---
id: table--servicios-convocatorias
tipo: TABLE
nombre: servicios.convocatorias
nivel: L2
dominio: servicios
resumen: Tabla servicios.convocatorias (9 columnas). Creada en 079_llamados_convocatorias.sql.
tabla: convocatorias
archivos:
  - database/migrations/079_llamados_convocatorias.sql
edges:
  - [defined_in, file--079-llamados-convocatorias]
  - [belongs_to, domain--servicios]
  - [references, table--servicios-llamados]
  - [references, table--servicios-servicios]
  - [references, table--seguridad-usuarios]
  - [references, table--seguridad-usuarios]
terminos: [servicios, convocatorias, llamado, servicio, mensaje, estado, creada, creado, cerrada]
---

# servicios.convocatorias

Tabla servicios.convocatorias (9 columnas). Creada en 079_llamados_convocatorias.sql.

- **Esquema:** servicios · **Columnas:** 9

## Restricciones CHECK (reglas que la BD impone)

- `estado IN ('ABIERTA', 'CERRADA')`

## Llaves foraneas

- `llamado_id` → [[table--servicios-llamados|servicios.llamados]]
- `servicio_id` → [[table--servicios-servicios|servicios.servicios]]
- `creada_por` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `cerrada_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| llamado_id | UNIQUEIDENTIFIER |
| servicio_id | UNIQUEIDENTIFIER |
| mensaje | NVARCHAR(500) |
| estado | NVARCHAR(20) |
| creada_por | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| cerrada_en | DATETIMEOFFSET(3) |
| cerrada_por | UNIQUEIDENTIFIER |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/079_llamados_convocatorias.sql`

## Relaciones

- `defined_in` → [[file--079-llamados-convocatorias|079_llamados_convocatorias.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]
- `references` → [[table--servicios-llamados|servicios.llamados]]
- `references` → [[table--servicios-servicios|servicios.servicios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[table--servicios-convocatoria-respuestas|servicios.convocatoria_respuestas]] `references` →
- [[table--servicios-convocatoria-respuesta-eventos|servicios.convocatoria_respuesta_eventos]] `references` →
- [[entity--convocatoria|Convocatoria]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
