---
id: table--deposito-inventario-fisico-items
tipo: TABLE
nombre: deposito.inventario_fisico_items
nivel: L2
dominio: deposito
resumen: Tabla deposito.inventario_fisico_items (11 columnas). Creada en 045_deposito_inventario_fisico.sql.
tabla: inventario_fisico_items
archivos:
  - database/migrations/045_deposito_inventario_fisico.sql
edges:
  - [defined_in, file--045-deposito-inventario-fisico]
  - [belongs_to, domain--deposito]
  - [references, table--deposito-inventarios-fisicos]
  - [references, table--deposito-articulos]
  - [references, table--equipos-equipos]
terminos: [deposito, inventario, fisico, items, tipo, elemento, articulo, equipo, cantidad, sistema, fisica, diferencia, genera, incidencia, observacion, creado]
---

# deposito.inventario_fisico_items

Tabla deposito.inventario_fisico_items (11 columnas). Creada en 045_deposito_inventario_fisico.sql.

- **Esquema:** deposito · **Columnas:** 11

## Llaves foraneas

- `inventario_fisico_id` → [[table--deposito-inventarios-fisicos|deposito.inventarios_fisicos]]
- `articulo_id` → [[table--deposito-articulos|deposito.articulos]]
- `equipo_id` → [[table--equipos-equipos|equipos.equipos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| inventario_fisico_id | UNIQUEIDENTIFIER |
| tipo_elemento | NVARCHAR(10) |
| articulo_id | UNIQUEIDENTIFIER |
| equipo_id | UNIQUEIDENTIFIER |
| cantidad_sistema | DECIMAL(15,2) |
| cantidad_fisica | DECIMAL(15,2) |
| diferencia | DECIMAL(15,2) |
| genera_incidencia | BIT |
| observacion | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/personal/[id]`
- **Endpoints:** InventariosFisicosController
- **Servicios:** InventariosFisicosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/045_deposito_inventario_fisico.sql`

## Relaciones

- `defined_in` → [[file--045-deposito-inventario-fisico|045_deposito_inventario_fisico.sql]]
- `belongs_to` → [[domain--deposito|Depósito]]
- `references` → [[table--deposito-inventarios-fisicos|deposito.inventarios_fisicos]]
- `references` → [[table--deposito-articulos|deposito.articulos]]
- `references` → [[table--equipos-equipos|equipos.equipos]]

## Referenciado por

- [[table--deposito-incidencias|deposito.incidencias]] `references` →
- [[entity--inventario-fisico-item-deposito|InventarioFisicoItemDeposito]] `persisted_in` →
- [[service--deposito-inventarios-fisicos|InventariosFisicosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
