---
id: table--servicios-servicio-mensajes
tipo: TABLE
nombre: servicios.servicio_mensajes
nivel: L2
dominio: servicios
resumen: Tabla servicios.servicio_mensajes (8 columnas). Creada en 090_despacho_servicio_seguridad.sql.
tabla: servicio_mensajes
archivos:
  - database/migrations/090_despacho_servicio_seguridad.sql
edges:
  - [defined_in, file--090-despacho-servicio-seguridad]
  - [belongs_to, domain--servicios]
  - [references, table--servicios-servicios]
  - [references, table--seguridad-usuarios]
terminos: [servicios, servicio, mensajes, usuario, nombre, texto, ocurrido, registrado, clave, idempotencia]
---

# servicios.servicio_mensajes

Tabla servicios.servicio_mensajes (8 columnas). Creada en 090_despacho_servicio_seguridad.sql.

- **Esquema:** servicios · **Columnas:** 8

## Llaves foraneas

- `servicio_id` → [[table--servicios-servicios|servicios.servicios]]
- `usuario_id` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | BIGINT |
| servicio_id | UNIQUEIDENTIFIER |
| usuario_id | UNIQUEIDENTIFIER |
| usuario_nombre | NVARCHAR(120) |
| texto | NVARCHAR(500) |
| ocurrido_en | DATETIMEOFFSET(3) |
| registrado_en | DATETIMEOFFSET(3) |
| clave_idempotencia | NVARCHAR(64) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/090_despacho_servicio_seguridad.sql`

## Relaciones

- `defined_in` → [[file--090-despacho-servicio-seguridad|090_despacho_servicio_seguridad.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]
- `references` → [[table--servicios-servicios|servicios.servicios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
