---
id: table--vehiculos-checklist-items
tipo: TABLE
nombre: vehiculos.checklist_items
nivel: L2
dominio: vehiculos
resumen: Tabla vehiculos.checklist_items (7 columnas). Creada en 023_moviles.sql.
tabla: checklist_items
archivos:
  - database/migrations/023_moviles.sql
edges:
  - [defined_in, file--023-moviles]
  - [belongs_to, domain--vehiculos]
terminos: [vehiculos, checklist, items, tipo, vehiculo, nombre, categoria, orden, activo, creado]
---

# vehiculos.checklist_items

Tabla vehiculos.checklist_items (7 columnas). Creada en 023_moviles.sql.

- **Esquema:** vehiculos · **Columnas:** 7

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| tipo_vehiculo | NVARCHAR(50) |
| nombre | NVARCHAR(150) |
| categoria | NVARCHAR(20) |
| orden | INT |
| activo | BIT |
| creado_en | DATETIMEOFFSET(3) |

## Archivos

- `database/migrations/023_moviles.sql`

## Relaciones

- `defined_in` → [[file--023-moviles|023_moviles.sql]]
- `belongs_to` → [[domain--vehiculos|Vehículos]]

## Referenciado por

- [[entity--checklist-item-vehiculo|ChecklistItemVehiculo]] `persisted_in` →
- [[service--vehiculos-checklist-items|ChecklistItemsService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
