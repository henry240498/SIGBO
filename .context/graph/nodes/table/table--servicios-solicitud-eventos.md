---
id: table--servicios-solicitud-eventos
tipo: TABLE
nombre: servicios.solicitud_eventos
nivel: L2
dominio: servicios
resumen: Tabla servicios.solicitud_eventos (9 columnas). Creada en 088_despacho_nucleo.sql.
tabla: solicitud_eventos
archivos:
  - database/migrations/088_despacho_nucleo.sql
edges:
  - [defined_in, file--088-despacho-nucleo]
  - [belongs_to, domain--servicios]
  - [references, table--servicios-solicitudes-despacho]
terminos: [servicios, solicitud, eventos, actor, nombre, destinatario, tipo, detalle, ocurrido, registrado]
---

# servicios.solicitud_eventos

Tabla servicios.solicitud_eventos (9 columnas). Creada en 088_despacho_nucleo.sql.

- **Esquema:** servicios · **Columnas:** 9

## Llaves foraneas

- `solicitud_id` → [[table--servicios-solicitudes-despacho|servicios.solicitudes_despacho]]

## Columnas

| Columna | Tipo |
|---|---|
| id | BIGINT |
| solicitud_id | UNIQUEIDENTIFIER |
| actor_id | UNIQUEIDENTIFIER |
| actor_nombre | NVARCHAR(120) |
| destinatario_id | UNIQUEIDENTIFIER |
| tipo | NVARCHAR(40) |
| detalle | NVARCHAR(MAX) |
| ocurrido_en | DATETIMEOFFSET(3) |
| registrado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/088_despacho_nucleo.sql`

## Relaciones

- `defined_in` → [[file--088-despacho-nucleo|088_despacho_nucleo.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]
- `references` → [[table--servicios-solicitudes-despacho|servicios.solicitudes_despacho]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
