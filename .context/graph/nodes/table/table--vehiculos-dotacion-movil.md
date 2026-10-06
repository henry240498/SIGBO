---
id: table--vehiculos-dotacion-movil
tipo: TABLE
nombre: vehiculos.dotacion_movil
nivel: L2
dominio: vehiculos
resumen: Tabla vehiculos.dotacion_movil (11 columnas). Creada en 081_flota_dotacion_bitacora.sql.
tabla: dotacion_movil
archivos:
  - database/migrations/081_flota_dotacion_bitacora.sql
edges:
  - [defined_in, file--081-flota-dotacion-bitacora]
  - [belongs_to, domain--vehiculos]
  - [references, table--vehiculos-vehiculos]
  - [references, table--seguridad-usuarios]
terminos: [vehiculos, dotacion, movil, vehiculo, descripcion, articulo, cantidad, objetivo, actual, controlado, activo, creado, actualizado]
---

# vehiculos.dotacion_movil

Tabla vehiculos.dotacion_movil (11 columnas). Creada en 081_flota_dotacion_bitacora.sql.

- **Esquema:** vehiculos · **Columnas:** 11

## Restricciones CHECK (reglas que la BD impone)

- `cantidad_objetivo >= 1`
- `cantidad_actual IS NULL OR cantidad_actual >= 0`

## Llaves foraneas

- `vehiculo_id` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `controlado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| vehiculo_id | UNIQUEIDENTIFIER |
| descripcion | NVARCHAR(200) |
| articulo_id | UNIQUEIDENTIFIER |
| cantidad_objetivo | INT |
| cantidad_actual | INT |
| controlado_en | DATETIMEOFFSET(3) |
| controlado_por | UNIQUEIDENTIFIER |
| activo | BIT |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/081_flota_dotacion_bitacora.sql`

## Relaciones

- `defined_in` → [[file--081-flota-dotacion-bitacora|081_flota_dotacion_bitacora.sql]]
- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `references` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--dotacion-movil|DotacionMovil]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
