---
id: table--deposito-articulos
tipo: TABLE
nombre: deposito.articulos
nivel: L2
dominio: deposito
resumen: Tabla deposito.articulos (17 columnas). Creada en 041_deposito_estructura.sql.
tabla: articulos
archivos:
  - database/migrations/041_deposito_estructura.sql
edges:
  - [defined_in, file--041-deposito-estructura]
  - [belongs_to, domain--deposito]
  - [references, table--deposito-categorias-articulo]
  - [references, table--organizacion-parametros]
terminos: [deposito, articulos, codigo, nombre, descripcion, categoria, articulo, unidad, medida, stock, actual, minimo, maximo, controla, lote, vencimiento, estado, institucion, creado, actualizado]
---

# deposito.articulos

Tabla deposito.articulos (17 columnas). Creada en 041_deposito_estructura.sql.

- **Esquema:** deposito · **Columnas:** 17
- **UNIQUE:** `codigo`

## Llaves foraneas

- `categoria_articulo_id` → [[table--deposito-categorias-articulo|deposito.categorias_articulo]]
- `unidad_medida_id` → [[table--organizacion-parametros|organizacion.parametros]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(50) |
| nombre | NVARCHAR(200) |
| descripcion | NVARCHAR(MAX) |
| categoria_articulo_id | UNIQUEIDENTIFIER |
| unidad_medida_id | UNIQUEIDENTIFIER |
| stock_actual | DECIMAL(15,2) |
| stock_minimo | DECIMAL(15,2) |
| stock_maximo | DECIMAL(15,2) |
| controla_lote | BIT |
| controla_vencimiento | BIT |
| estado | NVARCHAR(20) |
| institucion_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`
- **Endpoints:** ArticulosController, BajasController, ConsultasDepositoController, DashboardDepositoController, EntradasController, IntegracionDepositoController, LotesArticuloController, MantenimientosController, MovimientosDepositoController, PrestamosController
- **Servicios:** ArticulosService, BajasService, ConsultasDepositoService, DashboardDepositoService, EntradasService, IaToolsService, IntegracionDepositoService, LotesArticuloService, MantenimientosService, MovimientosDepositoService, PrestamosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/041_deposito_estructura.sql`

## Relaciones

- `defined_in` → [[file--041-deposito-estructura|041_deposito_estructura.sql]]
- `belongs_to` → [[domain--deposito|Depósito]]
- `references` → [[table--deposito-categorias-articulo|deposito.categorias_articulo]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]

## Referenciado por

- [[table--deposito-lotes-articulo|deposito.lotes_articulo]] `references` →
- [[table--deposito-tenencias|deposito.tenencias]] `references` →
- [[table--deposito-movimientos|deposito.movimientos]] `references` →
- [[table--deposito-entrada-items|deposito.entrada_items]] `references` →
- [[table--deposito-bajas|deposito.bajas]] `references` →
- [[table--deposito-prestamo-items|deposito.prestamo_items]] `references` →
- [[table--deposito-inventario-fisico-items|deposito.inventario_fisico_items]] `references` →
- [[table--deposito-incidencias|deposito.incidencias]] `references` →
- [[table--deposito-mantenimientos|deposito.mantenimientos]] `references` →
- [[entity--articulo|Articulo]] `persisted_in` →
- [[service--deposito-articulos|ArticulosService]] `reads` →
- [[service--deposito-bajas|BajasService]] `reads` →
- [[service--deposito-consultas-deposito|ConsultasDepositoService]] `reads` →
- [[service--deposito-dashboard-deposito|DashboardDepositoService]] `reads` →
- [[service--deposito-entradas|EntradasService]] `reads` →
- [[service--deposito-integracion-deposito|IntegracionDepositoService]] `reads` →
- [[service--deposito-lotes-articulo|LotesArticuloService]] `reads` →
- [[service--deposito-mantenimientos|MantenimientosService]] `reads` →
- [[service--deposito-movimientos-deposito|MovimientosDepositoService]] `reads` →
- [[service--deposito-prestamos|PrestamosService]] `reads` →
- [[service--ia-ia-tools|IaToolsService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
