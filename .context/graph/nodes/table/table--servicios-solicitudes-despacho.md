---
id: table--servicios-solicitudes-despacho
tipo: TABLE
nombre: servicios.solicitudes_despacho
nivel: L2
dominio: servicios
resumen: Tabla servicios.solicitudes_despacho (14 columnas). Creada en 088_despacho_nucleo.sql.
tabla: solicitudes_despacho
archivos:
  - database/migrations/088_despacho_nucleo.sql
edges:
  - [defined_in, file--088-despacho-nucleo]
  - [belongs_to, domain--servicios]
  - [references, table--servicios-servicios]
  - [references, table--servicios-llamados]
  - [references, table--seguridad-usuarios]
terminos: [servicios, solicitudes, despacho, tipo, servicio, llamado, mensaje, estado, requeridos, creada, nombre, creado, cerrada, motivo, cierre, clave, idempotencia]
---

# servicios.solicitudes_despacho

Tabla servicios.solicitudes_despacho (14 columnas). Creada en 088_despacho_nucleo.sql.

- **Esquema:** servicios · **Columnas:** 14

## Restricciones CHECK (reglas que la BD impone)

- `tipo IN ('CHOFER', 'PERSONAL', 'RAPIDA')`
- `estado IN ('ABIERTA', 'CERRADA', 'CANCELADA')`

## Llaves foraneas

- `servicio_id` → [[table--servicios-servicios|servicios.servicios]]
- `llamado_id` → [[table--servicios-llamados|servicios.llamados]]
- `creada_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| tipo | NVARCHAR(20) |
| servicio_id | UNIQUEIDENTIFIER |
| llamado_id | UNIQUEIDENTIFIER |
| mensaje | NVARCHAR(300) |
| estado | NVARCHAR(20) |
| requeridos | INT |
| creada_por | UNIQUEIDENTIFIER |
| creada_por_nombre | NVARCHAR(120) |
| creado_en | DATETIMEOFFSET(3) |
| cerrada_en | DATETIMEOFFSET(3) |
| cerrada_por | UNIQUEIDENTIFIER |
| motivo_cierre | NVARCHAR(300) |
| clave_idempotencia | NVARCHAR(64) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/088_despacho_nucleo.sql`

## Relaciones

- `defined_in` → [[file--088-despacho-nucleo|088_despacho_nucleo.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]
- `references` → [[table--servicios-servicios|servicios.servicios]]
- `references` → [[table--servicios-llamados|servicios.llamados]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[table--servicios-solicitud-moviles|servicios.solicitud_moviles]] `references` →
- [[table--servicios-solicitud-destinatarios|servicios.solicitud_destinatarios]] `references` →
- [[table--servicios-solicitud-eventos|servicios.solicitud_eventos]] `references` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
