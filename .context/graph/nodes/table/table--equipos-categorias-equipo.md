---
id: table--equipos-categorias-equipo
tipo: TABLE
nombre: equipos.categorias_equipo
nivel: L2
dominio: equipos
resumen: Tabla equipos.categorias_equipo (6 columnas). Creada en 006_vehiculos_equipos.sql, modificada por 009_foreign_keys.sql.
tabla: categorias_equipo
archivos:
  - database/migrations/006_vehiculos_equipos.sql
  - database/migrations/009_foreign_keys.sql
edges:
  - [defined_in, file--006-vehiculos-equipos]
  - [belongs_to, domain--equipos]
terminos: [equipos, categorias, equipo, nombre, descripcion, padre, activo, creado]
---

# equipos.categorias_equipo

Tabla equipos.categorias_equipo (6 columnas). Creada en 006_vehiculos_equipos.sql, modificada por 009_foreign_keys.sql.

- **Esquema:** equipos · **Columnas:** 6

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| nombre | NVARCHAR(100) |
| descripcion | NVARCHAR(MAX) |
| padre_id | UNIQUEIDENTIFIER |
| activo | BIT |
| creado_en | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** `/dashboard/deposito/bajas`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/equipos`, `/dashboard/equipos/[id]`, `/dashboard/equipos/categorias`, `/dashboard/personal/[id]`
- **Endpoints:** CategoriasEquipoController, EquiposController
- **Servicios:** CategoriasEquipoService, EquiposService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/006_vehiculos_equipos.sql`
- `database/migrations/009_foreign_keys.sql`

## Relaciones

- `defined_in` → [[file--006-vehiculos-equipos|006_vehiculos_equipos.sql]]
- `belongs_to` → [[domain--equipos|Equipos]]

## Referenciado por

- [[entity--categoria-equipo|CategoriaEquipo]] `persisted_in` →
- [[service--equipos-categorias-equipo|CategoriasEquipoService]] `reads` →
- [[service--equipos-equipos|EquiposService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
