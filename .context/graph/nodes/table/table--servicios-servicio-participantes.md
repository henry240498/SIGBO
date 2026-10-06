---
id: table--servicios-servicio-participantes
tipo: TABLE
nombre: servicios.servicio_participantes
nivel: L2
dominio: servicios
resumen: Tabla servicios.servicio_participantes (11 columnas). Creada en 090_despacho_servicio_seguridad.sql.
tabla: servicio_participantes
archivos:
  - database/migrations/090_despacho_servicio_seguridad.sql
edges:
  - [defined_in, file--090-despacho-servicio-seguridad]
  - [belongs_to, domain--servicios]
  - [references, table--servicios-servicios]
  - [references, table--seguridad-usuarios]
terminos: [servicios, servicio, participantes, usuario, nombre, rol, estado, solicitud, desde, llegada, hasta, version]
---

# servicios.servicio_participantes

Tabla servicios.servicio_participantes (11 columnas). Creada en 090_despacho_servicio_seguridad.sql.

- **Esquema:** servicios · **Columnas:** 11
- **UNIQUE:** `servicio_id, usuario_id`

## Restricciones CHECK (reglas que la BD impone)

- `estado IN ('EN_CAMINO', 'EN_SITIO', 'RETIRADO')`

## Llaves foraneas

- `servicio_id` → [[table--servicios-servicios|servicios.servicios]]
- `usuario_id` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| servicio_id | UNIQUEIDENTIFIER |
| usuario_id | UNIQUEIDENTIFIER |
| usuario_nombre | NVARCHAR(120) |
| rol | NVARCHAR(60) |
| estado | NVARCHAR(20) |
| solicitud_id | UNIQUEIDENTIFIER |
| desde | DATETIMEOFFSET(3) |
| llegada_en | DATETIMEOFFSET(3) |
| hasta | DATETIMEOFFSET(3) |
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
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--despacho-servicio|ServicioParticipante]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
