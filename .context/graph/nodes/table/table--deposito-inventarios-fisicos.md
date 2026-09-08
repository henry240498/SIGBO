---
id: table--deposito-inventarios-fisicos
tipo: TABLE
nombre: deposito.inventarios_fisicos
nivel: L2
dominio: deposito
resumen: Tabla deposito.inventarios_fisicos (9 columnas). Creada en 045_deposito_inventario_fisico.sql.
tabla: inventarios_fisicos
archivos:
  - database/migrations/045_deposito_inventario_fisico.sql
edges:
  - [defined_in, file--045-deposito-inventario-fisico]
  - [belongs_to, domain--deposito]
  - [references, table--deposito-ubicaciones]
  - [references, table--personal-bomberos]
terminos: [deposito, inventarios, fisicos, fecha, ubicacion, responsable, estado, observacion, institucion, creado]
---

# deposito.inventarios_fisicos

Tabla deposito.inventarios_fisicos (9 columnas). Creada en 045_deposito_inventario_fisico.sql.

- **Esquema:** deposito · **Columnas:** 9

## Llaves foraneas

- `ubicacion_id` → [[table--deposito-ubicaciones|deposito.ubicaciones]]
- `responsable_id` → [[table--personal-bomberos|personal.bomberos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| fecha | DATE |
| ubicacion_id | UNIQUEIDENTIFIER |
| responsable_id | UNIQUEIDENTIFIER |
| estado | NVARCHAR(20) |
| observacion | NVARCHAR(MAX) |
| institucion_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`
- **Endpoints:** InventariosFisicosController
- **Servicios:** InventariosFisicosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/045_deposito_inventario_fisico.sql`

## Relaciones

- `defined_in` → [[file--045-deposito-inventario-fisico|045_deposito_inventario_fisico.sql]]
- `belongs_to` → [[domain--deposito|Depósito]]
- `references` → [[table--deposito-ubicaciones|deposito.ubicaciones]]
- `references` → [[table--personal-bomberos|personal.bomberos]]

## Referenciado por

- [[table--deposito-inventario-fisico-items|deposito.inventario_fisico_items]] `references` →
- [[entity--inventario-fisico-deposito|InventarioFisicoDeposito]] `persisted_in` →
- [[service--deposito-inventarios-fisicos|InventariosFisicosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
