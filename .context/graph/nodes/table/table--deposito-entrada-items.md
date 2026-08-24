---
id: table--deposito-entrada-items
tipo: TABLE
nombre: deposito.entrada_items
nivel: L2
dominio: deposito
resumen: Tabla deposito.entrada_items (9 columnas). Creada en 042_deposito_entradas.sql.
tabla: entrada_items
archivos:
  - database/migrations/042_deposito_entradas.sql
edges:
  - [defined_in, file--042-deposito-entradas]
  - [belongs_to, domain--deposito]
  - [references, table--deposito-entradas]
  - [references, table--deposito-articulos]
  - [references, table--equipos-equipos]
  - [references, table--deposito-movimientos]
terminos: [deposito, entrada, items, tipo, elemento, articulo, equipo, cantidad, precio, unitario, subtotal, movimiento]
---

# deposito.entrada_items

Tabla deposito.entrada_items (9 columnas). Creada en 042_deposito_entradas.sql.

- **Esquema:** deposito · **Columnas:** 9

## Llaves foraneas

- `entrada_id` → [[table--deposito-entradas|deposito.entradas]]
- `articulo_id` → [[table--deposito-articulos|deposito.articulos]]
- `equipo_id` → [[table--equipos-equipos|equipos.equipos]]
- `movimiento_id` → [[table--deposito-movimientos|deposito.movimientos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| entrada_id | UNIQUEIDENTIFIER |
| tipo_elemento | NVARCHAR(10) |
| articulo_id | UNIQUEIDENTIFIER |
| equipo_id | UNIQUEIDENTIFIER |
| cantidad | DECIMAL(15,2) |
| precio_unitario | DECIMAL(15,2) |
| subtotal | DECIMAL(15,2) |
| movimiento_id | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/personal/[id]`
- **Endpoints:** EntradasController
- **Servicios:** EntradasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/042_deposito_entradas.sql`

## Relaciones

- `defined_in` → [[file--042-deposito-entradas|042_deposito_entradas.sql]]
- `belongs_to` → [[domain--deposito|Depósito]]
- `references` → [[table--deposito-entradas|deposito.entradas]]
- `references` → [[table--deposito-articulos|deposito.articulos]]
- `references` → [[table--equipos-equipos|equipos.equipos]]
- `references` → [[table--deposito-movimientos|deposito.movimientos]]

## Referenciado por

- [[entity--entrada-deposito-item|EntradaDepositoItem]] `persisted_in` →
- [[service--deposito-entradas|EntradasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
