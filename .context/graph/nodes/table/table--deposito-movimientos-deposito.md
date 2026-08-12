---
id: table--deposito-movimientos-deposito
tipo: TABLE
nombre: deposito.movimientos_deposito
nivel: L2
dominio: deposito
resumen: Tabla deposito.movimientos_deposito (12 columnas). Creada en 008_admin.sql, modificada por 009_foreign_keys.sql.
tabla: movimientos_deposito
archivos:
  - database/migrations/008_admin.sql
  - database/migrations/009_foreign_keys.sql
edges:
  - [defined_in, file--008-admin]
  - [belongs_to, domain--deposito]
terminos: [deposito, movimientos, item, tipo, fecha, cantidad, motivo, servicio, bombero, comprobante, url, observaciones, creado]
---

# deposito.movimientos_deposito

Tabla deposito.movimientos_deposito (12 columnas). Creada en 008_admin.sql, modificada por 009_foreign_keys.sql.

- **Esquema:** deposito · **Columnas:** 12

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| item_id | UNIQUEIDENTIFIER |
| tipo | NVARCHAR(10) |
| fecha | DATE |
| cantidad | DECIMAL(15,2) |
| motivo | NVARCHAR(100) |
| servicio_id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| comprobante_url | NVARCHAR(MAX) |
| observaciones | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Archivos

- `database/migrations/008_admin.sql`
- `database/migrations/009_foreign_keys.sql`

## Relaciones

- `defined_in` → [[file--008-admin|008_admin.sql]]
- `belongs_to` → [[domain--deposito|Depósito]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
