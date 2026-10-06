---
id: table--vehiculos-posicion-actual
tipo: TABLE
nombre: vehiculos.posicion_actual
nivel: L2
dominio: vehiculos
resumen: Tabla vehiculos.posicion_actual (8 columnas). Creada en 078_flota_posicion_mapa.sql.
tabla: posicion_actual
archivos:
  - database/migrations/078_flota_posicion_mapa.sql
edges:
  - [defined_in, file--078-flota-posicion-mapa]
  - [belongs_to, domain--vehiculos]
  - [references, table--vehiculos-vehiculos]
  - [references, table--seguridad-usuarios]
terminos: [vehiculos, posicion, actual, vehiculo, latitud, longitud, velocidad, kmh, precision, registrado, reportado, actualizado]
---

# vehiculos.posicion_actual

Tabla vehiculos.posicion_actual (8 columnas). Creada en 078_flota_posicion_mapa.sql.

- **Esquema:** vehiculos · **Columnas:** 8

## Restricciones CHECK (reglas que la BD impone)

- `latitud BETWEEN -90 AND 90`
- `longitud BETWEEN -180 AND 180`

## Llaves foraneas

- `vehiculo_id` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `reportado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| vehiculo_id | UNIQUEIDENTIFIER |
| latitud | DECIMAL(10,8) |
| longitud | DECIMAL(11,8) |
| velocidad_kmh | DECIMAL(5,1) |
| precision_m | DECIMAL(7,1) |
| registrado_en | DATETIMEOFFSET(3) |
| reportado_por | UNIQUEIDENTIFIER |
| actualizado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/078_flota_posicion_mapa.sql`

## Relaciones

- `defined_in` → [[file--078-flota-posicion-mapa|078_flota_posicion_mapa.sql]]
- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `references` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--posicion-movil|PosicionMovil]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
