---
id: table--vehiculos-mantenimientos-vehiculos
tipo: TABLE
nombre: vehiculos.mantenimientos_vehiculos
nivel: L2
dominio: vehiculos
resumen: Tabla vehiculos.mantenimientos_vehiculos (13 columnas). Creada en 006_vehiculos_equipos.sql, modificada por 009_foreign_keys.sql.
tabla: mantenimientos_vehiculos
archivos:
  - database/migrations/006_vehiculos_equipos.sql
  - database/migrations/009_foreign_keys.sql
edges:
  - [defined_in, file--006-vehiculos-equipos]
  - [belongs_to, domain--vehiculos]
terminos: [vehiculos, mantenimientos, vehiculo, tipo, fecha, descripcion, costo, kilometraje, taller, responsable, proximo, mantenimiento, archivo, url, creado]
---

# vehiculos.mantenimientos_vehiculos

Tabla vehiculos.mantenimientos_vehiculos (13 columnas). Creada en 006_vehiculos_equipos.sql, modificada por 009_foreign_keys.sql.

- **Esquema:** vehiculos · **Columnas:** 13

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| vehiculo_id | UNIQUEIDENTIFIER |
| tipo | NVARCHAR(30) |
| fecha | DATE |
| descripcion | NVARCHAR(MAX) |
| costo | DECIMAL(15,2) |
| kilometraje | INT |
| taller | NVARCHAR(100) |
| responsable | NVARCHAR(100) |
| proximo_mantenimiento | DATE |
| archivo_url | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/movimientos`, `/dashboard/equipos/[id]`, `/dashboard/personal/[id]`, `/dashboard/servicios/nuevo`, `/dashboard/vehiculos`, `/dashboard/vehiculos/[id]`, `/dashboard/vehiculos/checklist-items`
- **Endpoints:** VehiculosController
- **Servicios:** VehiculosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/006_vehiculos_equipos.sql`
- `database/migrations/009_foreign_keys.sql`

## Relaciones

- `defined_in` → [[file--006-vehiculos-equipos|006_vehiculos_equipos.sql]]
- `belongs_to` → [[domain--vehiculos|Vehículos]]

## Referenciado por

- [[entity--mantenimiento-vehiculo|MantenimientoVehiculo]] `persisted_in` →
- [[service--vehiculos-vehiculos|VehiculosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
