---
id: table--deposito-prestamo-items
tipo: TABLE
nombre: deposito.prestamo_items
nivel: L2
dominio: deposito
resumen: Tabla deposito.prestamo_items (10 columnas). Creada en 044_deposito_prestamos.sql.
tabla: prestamo_items
archivos:
  - database/migrations/044_deposito_prestamos.sql
edges:
  - [defined_in, file--044-deposito-prestamos]
  - [belongs_to, domain--deposito]
  - [references, table--deposito-prestamos]
  - [references, table--deposito-articulos]
  - [references, table--equipos-equipos]
  - [references, table--deposito-movimientos]
  - [references, table--deposito-movimientos]
terminos: [deposito, prestamo, items, tipo, elemento, articulo, equipo, cantidad, estado, item, observacion, movimiento, entrega, devolucion]
---

# deposito.prestamo_items

Tabla deposito.prestamo_items (10 columnas). Creada en 044_deposito_prestamos.sql.

- **Esquema:** deposito · **Columnas:** 10

## Llaves foraneas

- `prestamo_id` → [[table--deposito-prestamos|deposito.prestamos]]
- `articulo_id` → [[table--deposito-articulos|deposito.articulos]]
- `equipo_id` → [[table--equipos-equipos|equipos.equipos]]
- `movimiento_entrega_id` → [[table--deposito-movimientos|deposito.movimientos]]
- `movimiento_devolucion_id` → [[table--deposito-movimientos|deposito.movimientos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| prestamo_id | UNIQUEIDENTIFIER |
| tipo_elemento | NVARCHAR(10) |
| articulo_id | UNIQUEIDENTIFIER |
| equipo_id | UNIQUEIDENTIFIER |
| cantidad | DECIMAL(15,2) |
| estado_item | NVARCHAR(20) |
| observacion | NVARCHAR(MAX) |
| movimiento_entrega_id | UNIQUEIDENTIFIER |
| movimiento_devolucion_id | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`
- **Endpoints:** PrestamosController
- **Servicios:** PrestamosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/044_deposito_prestamos.sql`

## Relaciones

- `defined_in` → [[file--044-deposito-prestamos|044_deposito_prestamos.sql]]
- `belongs_to` → [[domain--deposito|Depósito]]
- `references` → [[table--deposito-prestamos|deposito.prestamos]]
- `references` → [[table--deposito-articulos|deposito.articulos]]
- `references` → [[table--equipos-equipos|equipos.equipos]]
- `references` → [[table--deposito-movimientos|deposito.movimientos]]
- `references` → [[table--deposito-movimientos|deposito.movimientos]]

## Referenciado por

- [[entity--prestamo-deposito-item|PrestamoDepositoItem]] `persisted_in` →
- [[service--deposito-prestamos|PrestamosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
