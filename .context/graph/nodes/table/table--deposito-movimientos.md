---
id: table--deposito-movimientos
tipo: TABLE
nombre: deposito.movimientos
nivel: L2
dominio: deposito
resumen: Tabla deposito.movimientos (22 columnas). Creada en 041_deposito_estructura.sql.
tabla: movimientos
archivos:
  - database/migrations/041_deposito_estructura.sql
edges:
  - [defined_in, file--041-deposito-estructura]
  - [belongs_to, domain--deposito]
  - [references, table--organizacion-parametros]
  - [references, table--equipos-equipos]
  - [references, table--deposito-articulos]
  - [references, table--deposito-lotes-articulo]
  - [references, table--deposito-ubicaciones]
  - [references, table--deposito-ubicaciones]
  - [references, table--vehiculos-vehiculos]
  - [references, table--vehiculos-vehiculos]
  - [references, table--personal-bomberos]
  - [references, table--personal-bomberos]
  - [references, table--servicios-servicios]
  - [references, table--servicios-servicios]
  - [references, table--personal-bomberos]
  - [references, table--seguridad-usuarios]
terminos: [deposito, movimientos, tipo, movimiento, elemento, equipo, articulo, lote, cantidad, ubicacion, origen, destino, vehiculo, bombero, servicio, responsable, motivo, observacion, documento, url, institucion, creado]
---

# deposito.movimientos

Tabla deposito.movimientos (22 columnas). Creada en 041_deposito_estructura.sql.

- **Esquema:** deposito · **Columnas:** 22

## Llaves foraneas

- `tipo_movimiento_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `equipo_id` → [[table--equipos-equipos|equipos.equipos]]
- `articulo_id` → [[table--deposito-articulos|deposito.articulos]]
- `lote_id` → [[table--deposito-lotes-articulo|deposito.lotes_articulo]]
- `ubicacion_origen_id` → [[table--deposito-ubicaciones|deposito.ubicaciones]]
- `ubicacion_destino_id` → [[table--deposito-ubicaciones|deposito.ubicaciones]]
- `vehiculo_origen_id` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `vehiculo_destino_id` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `bombero_origen_id` → [[table--personal-bomberos|personal.bomberos]]
- `bombero_destino_id` → [[table--personal-bomberos|personal.bomberos]]
- `servicio_origen_id` → [[table--servicios-servicios|servicios.servicios]]
- `servicio_destino_id` → [[table--servicios-servicios|servicios.servicios]]
- `responsable_id` → [[table--personal-bomberos|personal.bomberos]]
- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| tipo_movimiento_id | UNIQUEIDENTIFIER |
| tipo_elemento | NVARCHAR(10) |
| equipo_id | UNIQUEIDENTIFIER |
| articulo_id | UNIQUEIDENTIFIER |
| lote_id | UNIQUEIDENTIFIER |
| cantidad | DECIMAL(15,2) |
| ubicacion_origen_id | UNIQUEIDENTIFIER |
| ubicacion_destino_id | UNIQUEIDENTIFIER |
| vehiculo_origen_id | UNIQUEIDENTIFIER |
| vehiculo_destino_id | UNIQUEIDENTIFIER |
| bombero_origen_id | UNIQUEIDENTIFIER |
| bombero_destino_id | UNIQUEIDENTIFIER |
| servicio_origen_id | UNIQUEIDENTIFIER |
| servicio_destino_id | UNIQUEIDENTIFIER |
| responsable_id | UNIQUEIDENTIFIER |
| motivo | NVARCHAR(300) |
| observacion | NVARCHAR(MAX) |
| documento_url | NVARCHAR(MAX) |
| institucion_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`
- **Endpoints:** MovimientosDepositoController
- **Servicios:** MovimientosDepositoService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/041_deposito_estructura.sql`

## Relaciones

- `defined_in` → [[file--041-deposito-estructura|041_deposito_estructura.sql]]
- `belongs_to` → [[domain--deposito|Depósito]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--equipos-equipos|equipos.equipos]]
- `references` → [[table--deposito-articulos|deposito.articulos]]
- `references` → [[table--deposito-lotes-articulo|deposito.lotes_articulo]]
- `references` → [[table--deposito-ubicaciones|deposito.ubicaciones]]
- `references` → [[table--deposito-ubicaciones|deposito.ubicaciones]]
- `references` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `references` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `references` → [[table--personal-bomberos|personal.bomberos]]
- `references` → [[table--personal-bomberos|personal.bomberos]]
- `references` → [[table--servicios-servicios|servicios.servicios]]
- `references` → [[table--servicios-servicios|servicios.servicios]]
- `references` → [[table--personal-bomberos|personal.bomberos]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[table--deposito-entrada-items|deposito.entrada_items]] `references` →
- [[table--deposito-bajas|deposito.bajas]] `references` →
- [[table--deposito-prestamo-items|deposito.prestamo_items]] `references` →
- [[table--deposito-prestamo-items|deposito.prestamo_items]] `references` →
- [[table--deposito-mantenimientos|deposito.mantenimientos]] `references` →
- [[table--deposito-mantenimientos|deposito.mantenimientos]] `references` →
- [[entity--movimiento-deposito|MovimientoDeposito]] `persisted_in` →
- [[service--deposito-movimientos-deposito|MovimientosDepositoService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
