---
id: table--servicios-solicitud-destinatarios
tipo: TABLE
nombre: servicios.solicitud_destinatarios
nivel: L2
dominio: servicios
resumen: Tabla servicios.solicitud_destinatarios (17 columnas). Creada en 088_despacho_nucleo.sql, modificada por 092_despacho_chofer_habilitado.sql.
tabla: solicitud_destinatarios
archivos:
  - database/migrations/088_despacho_nucleo.sql
  - database/migrations/092_despacho_chofer_habilitado.sql
edges:
  - [defined_in, file--088-despacho-nucleo]
  - [belongs_to, domain--servicios]
  - [references, table--servicios-solicitudes-despacho]
  - [references, table--seguridad-usuarios]
terminos: [servicios, solicitud, destinatarios, usuario, nombre, entrega, enviada, recibida, visto, tarde, estado, respondido, aceptada, camino, llego, cancelada, motivo, ampliacion, version]
---

# servicios.solicitud_destinatarios

Tabla servicios.solicitud_destinatarios (17 columnas). Creada en 088_despacho_nucleo.sql, modificada por 092_despacho_chofer_habilitado.sql.

- **Esquema:** servicios · **Columnas:** 17
- **UNIQUE:** `solicitud_id, usuario_id`

## Restricciones CHECK (reglas que la BD impone)

- `entrega IN ('ENVIADA', 'SIN_CONEXION', 'NO_DISPONIBLE', 'FUERA_DE_HORARIO', 'EN_SERVICIO')`
- `estado IN ('PENDIENTE', 'ACEPTO', 'NO_PUEDE', 'CANCELO', 'EN_CAMINO', 'LLEGO')`
- `entrega IN ('ENVIADA', 'SIN_CONEXION', 'NO_DISPONIBLE', 'FUERA_DE_HORARIO', 'EN_SERVICIO', 'NO_HABILITADO_CHOFER')`

## Llaves foraneas

- `solicitud_id` → [[table--servicios-solicitudes-despacho|servicios.solicitudes_despacho]]
- `usuario_id` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| solicitud_id | UNIQUEIDENTIFIER |
| usuario_id | UNIQUEIDENTIFIER |
| usuario_nombre | NVARCHAR(120) |
| entrega | NVARCHAR(20) |
| enviada_en | DATETIMEOFFSET(3) |
| recibida_en | DATETIMEOFFSET(3) |
| visto_tarde_en | DATETIMEOFFSET(3) |
| estado | NVARCHAR(20) |
| respondido_en | DATETIMEOFFSET(3) |
| aceptada_en | DATETIMEOFFSET(3) |
| en_camino_en | DATETIMEOFFSET(3) |
| llego_en | DATETIMEOFFSET(3) |
| cancelada_en | DATETIMEOFFSET(3) |
| motivo | NVARCHAR(200) |
| ampliacion | BIT |
| version | INT |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/088_despacho_nucleo.sql`
- `database/migrations/092_despacho_chofer_habilitado.sql`

## Relaciones

- `defined_in` → [[file--088-despacho-nucleo|088_despacho_nucleo.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]
- `references` → [[table--servicios-solicitudes-despacho|servicios.solicitudes_despacho]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
