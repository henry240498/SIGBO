---
id: table--seguridad-navegacion-eventos
tipo: TABLE
nombre: seguridad.navegacion_eventos
nivel: L2
dominio: seguridad
resumen: Tabla seguridad.navegacion_eventos (14 columnas). Creada en 090_despacho_servicio_seguridad.sql.
tabla: navegacion_eventos
archivos:
  - database/migrations/090_despacho_servicio_seguridad.sql
edges:
  - [defined_in, file--090-despacho-servicio-seguridad]
  - [belongs_to, domain--seguridad]
  - [references, table--seguridad-usuarios]
  - [references, table--seguridad-pantallas]
terminos: [seguridad, navegacion, eventos, usuario, nombre, pantalla, codigo, entrada, salida, duracion, seg, servicio, accion, dispositivo, conectado, registrado, clave, idempotencia]
---

# seguridad.navegacion_eventos

Tabla seguridad.navegacion_eventos (14 columnas). Creada en 090_despacho_servicio_seguridad.sql.

- **Esquema:** seguridad · **Columnas:** 14

## Llaves foraneas

- `usuario_id` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `pantalla_codigo` → [[table--seguridad-pantallas|seguridad.pantallas]]

## Columnas

| Columna | Tipo |
|---|---|
| id | BIGINT |
| usuario_id | UNIQUEIDENTIFIER |
| usuario_nombre | NVARCHAR(120) |
| pantalla_codigo | NVARCHAR(10) |
| entrada | DATETIMEOFFSET(3) |
| salida | DATETIMEOFFSET(3) |
| duracion_seg | INT |
| servicio_id | UNIQUEIDENTIFIER |
| accion | NVARCHAR(120) |
| dispositivo | NVARCHAR(160) |
| conectado | BIT |
| ip | NVARCHAR(45) |
| registrado_en | DATETIMEOFFSET(3) |
| clave_idempotencia | NVARCHAR(64) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/090_despacho_servicio_seguridad.sql`

## Relaciones

- `defined_in` → [[file--090-despacho-servicio-seguridad|090_despacho_servicio_seguridad.sql]]
- `belongs_to` → [[domain--seguridad|Seguridad]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `references` → [[table--seguridad-pantallas|seguridad.pantallas]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
