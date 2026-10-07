---
id: table--servicios-incidente-solicitudes
tipo: TABLE
nombre: servicios.incidente_solicitudes
nivel: L2
dominio: servicios
resumen: Tabla servicios.incidente_solicitudes (13 columnas). Creada en 093_centro_operaciones_incidentes.sql.
tabla: incidente_solicitudes
archivos:
  - database/migrations/093_centro_operaciones_incidentes.sql
edges:
  - [defined_in, file--093-centro-operaciones-incidentes]
  - [belongs_to, domain--servicios]
  - [references, table--servicios-servicios]
  - [references, table--servicios-tipos-recurso]
  - [references, table--seguridad-usuarios]
  - [references, table--seguridad-usuarios]
terminos: [servicios, incidente, solicitudes, servicio, tipo, recurso, cantidad, prioridad, estado, observacion, solicitado, actualizado, version, clave, idempotencia]
---

# servicios.incidente_solicitudes

Tabla servicios.incidente_solicitudes (13 columnas). Creada en 093_centro_operaciones_incidentes.sql.

- **Esquema:** servicios · **Columnas:** 13

## Restricciones CHECK (reglas que la BD impone)

- `cantidad > 0`
- `prioridad IN ('NORMAL', 'URGENTE')`
- `estado IN ('SOLICITADO', 'APROBADO', 'DESPACHADO', 'EN_CAMINO', 'EN_USO', 'LIBERADO', 'RECHAZADO', 'CANCELADO')`

## Llaves foraneas

- `servicio_id` → [[table--servicios-servicios|servicios.servicios]]
- `tipo_recurso_id` → [[table--servicios-tipos-recurso|servicios.tipos_recurso]]
- `solicitado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `actualizado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| servicio_id | UNIQUEIDENTIFIER |
| tipo_recurso_id | UNIQUEIDENTIFIER |
| cantidad | INT |
| prioridad | NVARCHAR(10) |
| estado | NVARCHAR(12) |
| observacion | NVARCHAR(300) |
| solicitado_por | UNIQUEIDENTIFIER |
| solicitado_en | DATETIMEOFFSET(3) |
| actualizado_por | UNIQUEIDENTIFIER |
| actualizado_en | DATETIMEOFFSET(3) |
| version | INT |
| clave_idempotencia | NVARCHAR(64) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/093_centro_operaciones_incidentes.sql`

## Relaciones

- `defined_in` → [[file--093-centro-operaciones-incidentes|093_centro_operaciones_incidentes.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]
- `references` → [[table--servicios-servicios|servicios.servicios]]
- `references` → [[table--servicios-tipos-recurso|servicios.tipos_recurso]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
