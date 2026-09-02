---
id: table--deposito-incidencias
tipo: TABLE
nombre: deposito.incidencias
nivel: L2
dominio: deposito
resumen: Tabla deposito.incidencias (17 columnas). Creada en 045_deposito_inventario_fisico.sql.
tabla: incidencias
archivos:
  - database/migrations/045_deposito_inventario_fisico.sql
edges:
  - [defined_in, file--045-deposito-inventario-fisico]
  - [belongs_to, domain--deposito]
  - [references, table--deposito-articulos]
  - [references, table--equipos-equipos]
  - [references, table--vehiculos-vehiculos]
  - [references, table--operaciones-inspecciones-movil]
  - [references, table--deposito-inventario-fisico-items]
terminos: [deposito, incidencias, origen, tipo, elemento, articulo, equipo, vehiculo, inspeccion, movil, inventario, fisico, item, descripcion, gravedad, estado, fecha, apertura, reportado, resuelto, resolucion, institucion]
---

# deposito.incidencias

Tabla deposito.incidencias (17 columnas). Creada en 045_deposito_inventario_fisico.sql.

- **Esquema:** deposito · **Columnas:** 17

## Llaves foraneas

- `articulo_id` → [[table--deposito-articulos|deposito.articulos]]
- `equipo_id` → [[table--equipos-equipos|equipos.equipos]]
- `vehiculo_id` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `inspeccion_movil_id` → [[table--operaciones-inspecciones-movil|operaciones.inspecciones_movil]]
- `inventario_fisico_item_id` → [[table--deposito-inventario-fisico-items|deposito.inventario_fisico_items]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| origen_tipo | NVARCHAR(30) |
| tipo_elemento | NVARCHAR(10) |
| articulo_id | UNIQUEIDENTIFIER |
| equipo_id | UNIQUEIDENTIFIER |
| vehiculo_id | UNIQUEIDENTIFIER |
| inspeccion_movil_id | UNIQUEIDENTIFIER |
| inventario_fisico_item_id | UNIQUEIDENTIFIER |
| descripcion | NVARCHAR(MAX) |
| gravedad | NVARCHAR(10) |
| estado | NVARCHAR(20) |
| fecha_apertura | DATETIMEOFFSET(3) |
| reportado_por | UNIQUEIDENTIFIER |
| resuelto_por | UNIQUEIDENTIFIER |
| fecha_resolucion | DATETIMEOFFSET(3) |
| resolucion | NVARCHAR(MAX) |
| institucion_id | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`
- **Endpoints:** DashboardDepositoController, IncidenciasController, InventariosFisicosController
- **Servicios:** DashboardDepositoService, IncidenciasService, InventariosFisicosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/045_deposito_inventario_fisico.sql`

## Relaciones

- `defined_in` → [[file--045-deposito-inventario-fisico|045_deposito_inventario_fisico.sql]]
- `belongs_to` → [[domain--deposito|Depósito]]
- `references` → [[table--deposito-articulos|deposito.articulos]]
- `references` → [[table--equipos-equipos|equipos.equipos]]
- `references` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `references` → [[table--operaciones-inspecciones-movil|operaciones.inspecciones_movil]]
- `references` → [[table--deposito-inventario-fisico-items|deposito.inventario_fisico_items]]

## Referenciado por

- [[entity--incidencia-deposito|IncidenciaDeposito]] `persisted_in` →
- [[service--deposito-dashboard-deposito|DashboardDepositoService]] `reads` →
- [[service--deposito-incidencias|IncidenciasService]] `reads` →
- [[service--deposito-inventarios-fisicos|InventariosFisicosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
