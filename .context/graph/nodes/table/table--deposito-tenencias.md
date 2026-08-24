---
id: table--deposito-tenencias
tipo: TABLE
nombre: deposito.tenencias
nivel: L2
dominio: deposito
resumen: Tabla deposito.tenencias (16 columnas). Creada en 041_deposito_estructura.sql.
tabla: tenencias
archivos:
  - database/migrations/041_deposito_estructura.sql
edges:
  - [defined_in, file--041-deposito-estructura]
  - [belongs_to, domain--deposito]
  - [references, table--equipos-equipos]
  - [references, table--deposito-articulos]
  - [references, table--deposito-lotes-articulo]
  - [references, table--organizacion-parametros]
  - [references, table--deposito-ubicaciones]
  - [references, table--vehiculos-vehiculos]
  - [references, table--personal-bomberos]
  - [references, table--servicios-servicios]
  - [references, table--organizacion-parametros]
terminos: [deposito, tenencias, tipo, elemento, equipo, articulo, lote, cantidad, tenencia, ubicacion, vehiculo, bombero, servicio, estado, observacion, institucion, actualizado]
---

# deposito.tenencias

Tabla deposito.tenencias (16 columnas). Creada en 041_deposito_estructura.sql.

- **Esquema:** deposito · **Columnas:** 16

## Restricciones CHECK (reglas que la BD impone)

- `tipo_elemento IN (N'EQUIPO', N'ARTICULO')), CONSTRAINT CK_ten_elemento CHECK ( (tipo_elemento = N'EQUIPO' AND equipo_id IS NOT NULL AND articulo_id IS NULL) OR (tipo_elemento = N'ARTICULO' AND articulo_id IS NOT NULL AND equipo_id IS NULL`

## Llaves foraneas

- `equipo_id` → [[table--equipos-equipos|equipos.equipos]]
- `articulo_id` → [[table--deposito-articulos|deposito.articulos]]
- `lote_id` → [[table--deposito-lotes-articulo|deposito.lotes_articulo]]
- `tipo_tenencia_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `ubicacion_id` → [[table--deposito-ubicaciones|deposito.ubicaciones]]
- `vehiculo_id` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]
- `servicio_id` → [[table--servicios-servicios|servicios.servicios]]
- `estado_elemento_id` → [[table--organizacion-parametros|organizacion.parametros]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| tipo_elemento | NVARCHAR(10) |
| equipo_id | UNIQUEIDENTIFIER |
| articulo_id | UNIQUEIDENTIFIER |
| lote_id | UNIQUEIDENTIFIER |
| cantidad | DECIMAL(15,2) |
| tipo_tenencia_id | UNIQUEIDENTIFIER |
| ubicacion_id | UNIQUEIDENTIFIER |
| vehiculo_id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| servicio_id | UNIQUEIDENTIFIER |
| estado_elemento_id | UNIQUEIDENTIFIER |
| observacion | NVARCHAR(MAX) |
| institucion_id | UNIQUEIDENTIFIER |
| actualizado_en | DATETIMEOFFSET(3) |
| actualizado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/personal/[id]`
- **Endpoints:** ArticulosController, BajasController, ConsultasDepositoController, DashboardDepositoController, IntegracionDepositoController, InventariosFisicosController, MantenimientosController, MovimientosDepositoController
- **Servicios:** ArticulosService, BajasService, ConsultasDepositoService, DashboardDepositoService, IntegracionDepositoService, InventariosFisicosService, MantenimientosService, MovimientosDepositoService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/041_deposito_estructura.sql`

## Relaciones

- `defined_in` → [[file--041-deposito-estructura|041_deposito_estructura.sql]]
- `belongs_to` → [[domain--deposito|Depósito]]
- `references` → [[table--equipos-equipos|equipos.equipos]]
- `references` → [[table--deposito-articulos|deposito.articulos]]
- `references` → [[table--deposito-lotes-articulo|deposito.lotes_articulo]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--deposito-ubicaciones|deposito.ubicaciones]]
- `references` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `references` → [[table--personal-bomberos|personal.bomberos]]
- `references` → [[table--servicios-servicios|servicios.servicios]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]

## Referenciado por

- [[entity--tenencia-deposito|TenenciaDeposito]] `persisted_in` →
- [[service--deposito-articulos|ArticulosService]] `reads` →
- [[service--deposito-bajas|BajasService]] `reads` →
- [[service--deposito-consultas-deposito|ConsultasDepositoService]] `reads` →
- [[service--deposito-dashboard-deposito|DashboardDepositoService]] `reads` →
- [[service--deposito-integracion-deposito|IntegracionDepositoService]] `reads` →
- [[service--deposito-inventarios-fisicos|InventariosFisicosService]] `reads` →
- [[service--deposito-mantenimientos|MantenimientosService]] `reads` →
- [[service--deposito-movimientos-deposito|MovimientosDepositoService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
