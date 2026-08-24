---
id: table--deposito-lotes-articulo
tipo: TABLE
nombre: deposito.lotes_articulo
nivel: L2
dominio: deposito
resumen: Tabla deposito.lotes_articulo (9 columnas). Creada en 041_deposito_estructura.sql.
tabla: lotes_articulo
archivos:
  - database/migrations/041_deposito_estructura.sql
edges:
  - [defined_in, file--041-deposito-estructura]
  - [belongs_to, domain--deposito]
  - [references, table--deposito-articulos]
terminos: [deposito, lotes, articulo, numero, lote, fecha, fabricacion, vencimiento, cantidad, estado, creado, actualizado]
---

# deposito.lotes_articulo

Tabla deposito.lotes_articulo (9 columnas). Creada en 041_deposito_estructura.sql.

- **Esquema:** deposito · **Columnas:** 9
- **UNIQUE:** `articulo_id, numero_lote`

## Llaves foraneas

- `articulo_id` → [[table--deposito-articulos|deposito.articulos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| articulo_id | UNIQUEIDENTIFIER |
| numero_lote | NVARCHAR(50) |
| fecha_fabricacion | DATE |
| fecha_vencimiento | DATE |
| cantidad | DECIMAL(15,2) |
| estado | NVARCHAR(20) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/personal/[id]`
- **Endpoints:** DashboardDepositoController, LotesArticuloController
- **Servicios:** DashboardDepositoService, LotesArticuloService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/041_deposito_estructura.sql`

## Relaciones

- `defined_in` → [[file--041-deposito-estructura|041_deposito_estructura.sql]]
- `belongs_to` → [[domain--deposito|Depósito]]
- `references` → [[table--deposito-articulos|deposito.articulos]]

## Referenciado por

- [[table--deposito-tenencias|deposito.tenencias]] `references` →
- [[table--deposito-movimientos|deposito.movimientos]] `references` →
- [[entity--lote-articulo|LoteArticulo]] `persisted_in` →
- [[service--deposito-dashboard-deposito|DashboardDepositoService]] `reads` →
- [[service--deposito-lotes-articulo|LotesArticuloService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
