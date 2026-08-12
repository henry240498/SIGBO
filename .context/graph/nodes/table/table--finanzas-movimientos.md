---
id: table--finanzas-movimientos
tipo: TABLE
nombre: finanzas.movimientos
nivel: L2
dominio: finanzas
resumen: Tabla finanzas.movimientos (15 columnas). Creada en 008_admin.sql, modificada por 009_foreign_keys.sql.
tabla: movimientos
archivos:
  - database/migrations/008_admin.sql
  - database/migrations/009_foreign_keys.sql
edges:
  - [defined_in, file--008-admin]
  - [belongs_to, domain--finanzas]
terminos: [finanzas, movimientos, cuenta, tipo, fecha, descripcion, monto, categoria, forma, pago, referencia, comprobante, url, proyecto, donante, proveedor, creado]
---

# finanzas.movimientos

Tabla finanzas.movimientos (15 columnas). Creada en 008_admin.sql, modificada por 009_foreign_keys.sql.

- **Esquema:** finanzas · **Columnas:** 15

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| cuenta_id | UNIQUEIDENTIFIER |
| tipo | NVARCHAR(10) |
| fecha | DATE |
| descripcion | NVARCHAR(MAX) |
| monto | DECIMAL(15,2) |
| categoria | NVARCHAR(50) |
| forma_pago | NVARCHAR(30) |
| referencia | NVARCHAR(100) |
| comprobante_url | NVARCHAR(MAX) |
| proyecto | NVARCHAR(100) |
| donante_id | UNIQUEIDENTIFIER |
| proveedor | NVARCHAR(200) |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Archivos

- `database/migrations/008_admin.sql`
- `database/migrations/009_foreign_keys.sql`

## Relaciones

- `defined_in` → [[file--008-admin|008_admin.sql]]
- `belongs_to` → [[domain--finanzas|Finanzas]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
