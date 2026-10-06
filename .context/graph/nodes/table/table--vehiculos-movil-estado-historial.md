---
id: table--vehiculos-movil-estado-historial
tipo: TABLE
nombre: vehiculos.movil_estado_historial
nivel: L2
dominio: vehiculos
resumen: Tabla vehiculos.movil_estado_historial (9 columnas). Creada en 077_flota_estado_despacho.sql.
tabla: movil_estado_historial
archivos:
  - database/migrations/077_flota_estado_despacho.sql
edges:
  - [defined_in, file--077-flota-estado-despacho]
  - [belongs_to, domain--vehiculos]
  - [references, table--vehiculos-vehiculos]
  - [references, table--servicios-servicios]
  - [references, table--seguridad-usuarios]
terminos: [vehiculos, movil, estado, historial, vehiculo, anterior, nuevo, servicio, despacho, motivo, usuario, creado]
---

# vehiculos.movil_estado_historial

Tabla vehiculos.movil_estado_historial (9 columnas). Creada en 077_flota_estado_despacho.sql.

- **Esquema:** vehiculos · **Columnas:** 9

## Llaves foraneas

- `vehiculo_id` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `servicio_id` → [[table--servicios-servicios|servicios.servicios]]
- `usuario_id` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| vehiculo_id | UNIQUEIDENTIFIER |
| estado_anterior | NVARCHAR(20) |
| estado_nuevo | NVARCHAR(20) |
| servicio_id | UNIQUEIDENTIFIER |
| despacho_id | UNIQUEIDENTIFIER |
| motivo | NVARCHAR(500) |
| usuario_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/077_flota_estado_despacho.sql`

## Relaciones

- `defined_in` → [[file--077-flota-estado-despacho|077_flota_estado_despacho.sql]]
- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `references` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `references` → [[table--servicios-servicios|servicios.servicios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--movil-estado-historial|MovilEstadoHistorial]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
