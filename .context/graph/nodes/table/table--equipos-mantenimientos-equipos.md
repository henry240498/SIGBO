---
id: table--equipos-mantenimientos-equipos
tipo: TABLE
nombre: equipos.mantenimientos_equipos
nivel: L2
dominio: equipos
resumen: Tabla equipos.mantenimientos_equipos (12 columnas). Creada en 006_vehiculos_equipos.sql, modificada por 009_foreign_keys.sql.
tabla: mantenimientos_equipos
archivos:
  - database/migrations/006_vehiculos_equipos.sql
  - database/migrations/009_foreign_keys.sql
edges:
  - [defined_in, file--006-vehiculos-equipos]
  - [belongs_to, domain--equipos]
terminos: [equipos, mantenimientos, equipo, fecha, tipo, descripcion, costo, proveedor, tecnico, proximo, mantenimiento, archivo, url, creado]
---

# equipos.mantenimientos_equipos

Tabla equipos.mantenimientos_equipos (12 columnas). Creada en 006_vehiculos_equipos.sql, modificada por 009_foreign_keys.sql.

- **Esquema:** equipos · **Columnas:** 12

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| equipo_id | UNIQUEIDENTIFIER |
| fecha | DATE |
| tipo | NVARCHAR(30) |
| descripcion | NVARCHAR(MAX) |
| costo | DECIMAL(15,2) |
| proveedor | NVARCHAR(100) |
| tecnico | NVARCHAR(100) |
| proximo_mantenimiento | DATE |
| archivo_url | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/deposito/bajas`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/equipos`, `/dashboard/equipos/[id]`, `/dashboard/equipos/categorias`, `/dashboard/personal/[id]`
- **Endpoints:** EquiposController
- **Servicios:** EquiposService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/006_vehiculos_equipos.sql`
- `database/migrations/009_foreign_keys.sql`

## Relaciones

- `defined_in` → [[file--006-vehiculos-equipos|006_vehiculos_equipos.sql]]
- `belongs_to` → [[domain--equipos|Equipos]]

## Referenciado por

- [[entity--mantenimiento-equipo|MantenimientoEquipo]] `persisted_in` →
- [[service--equipos-equipos|EquiposService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
