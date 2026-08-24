---
id: table--finanzas-documentos-respaldo
tipo: TABLE
nombre: finanzas.documentos_respaldo
nivel: L2
dominio: finanzas
resumen: Tabla finanzas.documentos_respaldo (13 columnas). Creada en 049_finanzas_movimientos.sql, modificada por 051_finanzas_ordenes_pago.sql.
tabla: documentos_respaldo
archivos:
  - database/migrations/049_finanzas_movimientos.sql
  - database/migrations/051_finanzas_ordenes_pago.sql
edges:
  - [defined_in, file--049-finanzas-movimientos]
  - [belongs_to, domain--finanzas]
  - [references, table--finanzas-movimientos-financieros]
  - [references, table--organizacion-parametros]
  - [references, table--deposito-proveedores]
  - [references, table--seguridad-usuarios]
terminos: [finanzas, documentos, respaldo, movimiento, orden, pago, tipo, documento, numero, timbrado, fecha, proveedor, importe, archivo, url, observacion, creado]
---

# finanzas.documentos_respaldo

Tabla finanzas.documentos_respaldo (13 columnas). Creada en 049_finanzas_movimientos.sql, modificada por 051_finanzas_ordenes_pago.sql.

- **Esquema:** finanzas · **Columnas:** 13

## Llaves foraneas

- `movimiento_id` → [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]]
- `tipo_documento_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `proveedor_id` → [[table--deposito-proveedores|deposito.proveedores]]
- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| movimiento_id | UNIQUEIDENTIFIER |
| orden_pago_id | UNIQUEIDENTIFIER |
| tipo_documento_id | UNIQUEIDENTIFIER |
| numero | NVARCHAR(100) |
| timbrado | NVARCHAR(50) |
| fecha | DATE |
| proveedor_id | UNIQUEIDENTIFIER |
| importe | DECIMAL(15,2) |
| archivo_url | NVARCHAR(MAX) |
| observacion | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** MovimientosFinancierosController, ReportesFinanzasController
- **Servicios:** MovimientosFinancierosService, ReportesFinanzasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/049_finanzas_movimientos.sql`
- `database/migrations/051_finanzas_ordenes_pago.sql`

## Relaciones

- `defined_in` → [[file--049-finanzas-movimientos|049_finanzas_movimientos.sql]]
- `belongs_to` → [[domain--finanzas|Finanzas]]
- `references` → [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--deposito-proveedores|deposito.proveedores]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--documento-respaldo|DocumentoRespaldo]] `persisted_in` →
- [[service--finanzas-movimientos-financieros|MovimientosFinancierosService]] `reads` →
- [[service--finanzas-reportes-finanzas|ReportesFinanzasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
