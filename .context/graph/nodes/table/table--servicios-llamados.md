---
id: table--servicios-llamados
tipo: TABLE
nombre: servicios.llamados
nivel: L2
dominio: servicios
resumen: Tabla servicios.llamados (18 columnas). Creada en 079_llamados_convocatorias.sql, modificada por 085_llamados_idempotencia.sql.
tabla: llamados
archivos:
  - database/migrations/079_llamados_convocatorias.sql
  - database/migrations/085_llamados_idempotencia.sql
edges:
  - [defined_in, file--079-llamados-convocatorias]
  - [belongs_to, domain--servicios]
  - [references, table--servicios-tipos-servicio]
  - [references, table--servicios-servicios]
  - [references, table--seguridad-usuarios]
  - [references, table--seguridad-usuarios]
terminos: [servicios, llamados, recibido, medio, llamante, nombre, telefono, direccion, referencia, descripcion, tipo, servicio, estado, motivo, cierre, cerrado, creado, actualizado, clave, idempotencia]
---

# servicios.llamados

Tabla servicios.llamados (18 columnas). Creada en 079_llamados_convocatorias.sql, modificada por 085_llamados_idempotencia.sql.

- **Esquema:** servicios · **Columnas:** 18

## Restricciones CHECK (reglas que la BD impone)

- `estado IN ('RECIBIDO', 'EN_ATENCION', 'CERRADO')`

## Llaves foraneas

- `tipo_servicio_id` → [[table--servicios-tipos-servicio|servicios.tipos_servicio]]
- `servicio_id` → [[table--servicios-servicios|servicios.servicios]]
- `recibido_por` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `cerrado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| recibido_en | DATETIMEOFFSET(3) |
| medio | NVARCHAR(40) |
| llamante_nombre | NVARCHAR(150) |
| llamante_telefono | NVARCHAR(40) |
| direccion | NVARCHAR(300) |
| referencia | NVARCHAR(300) |
| descripcion | NVARCHAR(1000) |
| tipo_servicio_id | UNIQUEIDENTIFIER |
| estado | NVARCHAR(20) |
| servicio_id | UNIQUEIDENTIFIER |
| motivo_cierre | NVARCHAR(500) |
| recibido_por | UNIQUEIDENTIFIER |
| cerrado_por | UNIQUEIDENTIFIER |
| cerrado_en | DATETIMEOFFSET(3) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| clave_idempotencia | NVARCHAR(64) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/079_llamados_convocatorias.sql`
- `database/migrations/085_llamados_idempotencia.sql`

## Relaciones

- `defined_in` → [[file--079-llamados-convocatorias|079_llamados_convocatorias.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]
- `references` → [[table--servicios-tipos-servicio|servicios.tipos_servicio]]
- `references` → [[table--servicios-servicios|servicios.servicios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[table--servicios-convocatorias|servicios.convocatorias]] `references` →
- [[table--servicios-solicitudes-despacho|servicios.solicitudes_despacho]] `references` →
- [[entity--llamado|Llamado]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
