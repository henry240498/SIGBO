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
