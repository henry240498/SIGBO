---
id: table--deposito-categorias-articulo
tipo: TABLE
nombre: deposito.categorias_articulo
nivel: L2
dominio: deposito
resumen: Tabla deposito.categorias_articulo (7 columnas). Creada en 041_deposito_estructura.sql.
tabla: categorias_articulo
archivos:
  - database/migrations/041_deposito_estructura.sql
edges:
  - [defined_in, file--041-deposito-estructura]
  - [belongs_to, domain--deposito]
terminos: [deposito, categorias, articulo, codigo, nombre, descripcion, padre, activo, creado]
---

# deposito.categorias_articulo

Tabla deposito.categorias_articulo (7 columnas). Creada en 041_deposito_estructura.sql.

- **Esquema:** deposito · **Columnas:** 7

## Llaves foraneas

- `padre_id` → [[table--deposito-categorias-articulo|deposito.categorias_articulo]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(30) |
| nombre | NVARCHAR(150) |
| descripcion | NVARCHAR(MAX) |
| padre_id | UNIQUEIDENTIFIER |
| activo | BIT |
| creado_en | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`
- **Endpoints:** CategoriasArticuloController
- **Servicios:** CategoriasArticuloService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/041_deposito_estructura.sql`

## Relaciones

- `defined_in` → [[file--041-deposito-estructura|041_deposito_estructura.sql]]
- `belongs_to` → [[domain--deposito|Depósito]]

## Referenciado por

- [[table--deposito-articulos|deposito.articulos]] `references` →
- [[entity--categoria-articulo|CategoriaArticulo]] `persisted_in` →
- [[service--deposito-categorias-articulo|CategoriasArticuloService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
