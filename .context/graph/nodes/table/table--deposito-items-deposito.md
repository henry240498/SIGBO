---
id: table--deposito-items-deposito
tipo: TABLE
nombre: deposito.items_deposito
nivel: L2
dominio: deposito
resumen: Tabla deposito.items_deposito (19 columnas). Creada en 008_admin.sql.
tabla: items_deposito
archivos:
  - database/migrations/008_admin.sql
edges:
  - [defined_in, file--008-admin]
  - [belongs_to, domain--deposito]
terminos: [deposito, items, codigo, nombre, descripcion, categoria, unidad, medida, stock, actual, minimo, maximo, ubicacion, proveedor, fecha, vencimiento, lote, precio, unitario, alerta, bajo, code, creado, actualizado]
---

# deposito.items_deposito

Tabla deposito.items_deposito (19 columnas). Creada en 008_admin.sql.

- **Esquema:** deposito · **Columnas:** 19
- **UNIQUE:** `codigo`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(50) |
| nombre | NVARCHAR(200) |
| descripcion | NVARCHAR(MAX) |
| categoria | NVARCHAR(50) |
| unidad_medida | NVARCHAR(20) |
| stock_actual | DECIMAL(15,2) |
| stock_minimo | DECIMAL(15,2) |
| stock_maximo | DECIMAL(15,2) |
| ubicacion | NVARCHAR(100) |
| proveedor | NVARCHAR(200) |
| fecha_vencimiento | DATE |
| lote | NVARCHAR(50) |
| precio_unitario | DECIMAL(15,2) |
| alerta_stock_bajo | BIT |
| alerta_vencimiento | BIT |
| qr_code | NVARCHAR(200) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/008_admin.sql`

## Relaciones

- `defined_in` → [[file--008-admin|008_admin.sql]]
- `belongs_to` → [[domain--deposito|Depósito]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
