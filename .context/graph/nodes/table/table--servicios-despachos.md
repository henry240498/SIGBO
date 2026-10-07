---
id: table--servicios-despachos
tipo: TABLE
nombre: servicios.despachos
nivel: L2
dominio: servicios
resumen: Tabla servicios.despachos (17 columnas). Creada en 077_flota_estado_despacho.sql, modificada por 081_flota_dotacion_bitacora.sql, 093_centro_operaciones_incidentes.sql.
tabla: despachos
archivos:
  - database/migrations/077_flota_estado_despacho.sql
  - database/migrations/081_flota_dotacion_bitacora.sql
  - database/migrations/093_centro_operaciones_incidentes.sql
edges:
  - [defined_in, file--077-flota-estado-despacho]
  - [belongs_to, domain--servicios]
  - [references, table--servicios-servicios]
  - [references, table--vehiculos-vehiculos]
  - [references, table--seguridad-usuarios]
terminos: [servicios, despachos, servicio, vehiculo, conductor, estado, hora, salida, llegada, fin, regreso, observaciones, motivo, cancelacion, creado, actualizado, despacho]
---

# servicios.despachos

Tabla servicios.despachos (17 columnas). Creada en 077_flota_estado_despacho.sql, modificada por 081_flota_dotacion_bitacora.sql, 093_centro_operaciones_incidentes.sql.

- **Esquema:** servicios · **Columnas:** 17

## Restricciones CHECK (reglas que la BD impone)

- `estado IN ('DESPACHADO', 'EN_SERVICIO', 'REGRESANDO', 'CERRADO', 'CANCELADO')`

## Llaves foraneas

- `servicio_id` → [[table--servicios-servicios|servicios.servicios]]
- `vehiculo_id` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| servicio_id | UNIQUEIDENTIFIER |
| vehiculo_id | UNIQUEIDENTIFIER |
| conductor_id | UNIQUEIDENTIFIER |
| estado | NVARCHAR(20) |
| hora_salida | DATETIMEOFFSET(3) |
| hora_llegada | DATETIMEOFFSET(3) |
| hora_fin | DATETIMEOFFSET(3) |
| hora_regreso | DATETIMEOFFSET(3) |
| observaciones | NVARCHAR(500) |
| motivo_cancelacion | NVARCHAR(500) |
| creado_por | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| km_salida | INT |
| km_regreso | INT |
| hora_despacho | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/077_flota_estado_despacho.sql`
- `database/migrations/081_flota_dotacion_bitacora.sql`
- `database/migrations/093_centro_operaciones_incidentes.sql`

## Relaciones

- `defined_in` → [[file--077-flota-estado-despacho|077_flota_estado_despacho.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]
- `references` → [[table--servicios-servicios|servicios.servicios]]
- `references` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--despacho|Despacho]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
