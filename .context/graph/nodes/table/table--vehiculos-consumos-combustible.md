---
id: table--vehiculos-consumos-combustible
tipo: TABLE
nombre: vehiculos.consumos_combustible
nivel: L2
dominio: vehiculos
resumen: Tabla vehiculos.consumos_combustible (11 columnas). Creada en 006_vehiculos_equipos.sql, modificada por 009_foreign_keys.sql.
tabla: consumos_combustible
archivos:
  - database/migrations/006_vehiculos_equipos.sql
  - database/migrations/009_foreign_keys.sql
edges:
  - [defined_in, file--006-vehiculos-equipos]
  - [belongs_to, domain--vehiculos]
terminos: [vehiculos, consumos, combustible, vehiculo, fecha, galones, kilometraje, actual, tipo, costo, proveedor, factura, creado]
---

# vehiculos.consumos_combustible

Tabla vehiculos.consumos_combustible (11 columnas). Creada en 006_vehiculos_equipos.sql, modificada por 009_foreign_keys.sql.

- **Esquema:** vehiculos · **Columnas:** 11

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| vehiculo_id | UNIQUEIDENTIFIER |
| fecha | DATE |
| galones | DECIMAL(10,2) |
| kilometraje_actual | INT |
| tipo_combustible | NVARCHAR(20) |
| costo | DECIMAL(15,2) |
| proveedor | NVARCHAR(100) |
| factura | NVARCHAR(50) |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Archivos

- `database/migrations/006_vehiculos_equipos.sql`
- `database/migrations/009_foreign_keys.sql`

## Relaciones

- `defined_in` → [[file--006-vehiculos-equipos|006_vehiculos_equipos.sql]]
- `belongs_to` → [[domain--vehiculos|Vehículos]]

<<<<<<< Updated upstream
## Referenciado por

- [[entity--consumo-combustible|ConsumoCombustible]] `persisted_in` →
- [[service--vehiculos-vehiculos|VehiculosService]] `reads` →

=======
>>>>>>> Stashed changes
---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
