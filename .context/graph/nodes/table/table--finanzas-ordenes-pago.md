---
id: table--finanzas-ordenes-pago
tipo: TABLE
nombre: finanzas.ordenes_pago
nivel: L2
dominio: finanzas
resumen: Tabla finanzas.ordenes_pago (26 columnas). Creada en 051_finanzas_ordenes_pago.sql.
tabla: ordenes_pago
archivos:
  - database/migrations/051_finanzas_ordenes_pago.sql
edges:
  - [defined_in, file--051-finanzas-ordenes-pago]
  - [belongs_to, domain--finanzas]
  - [references, table--organizacion-parametros]
  - [references, table--deposito-proveedores]
  - [references, table--finanzas-cajas]
  - [references, table--finanzas-cuentas-bancarias]
  - [references, table--finanzas-ejercicios-fiscales]
  - [references, table--finanzas-movimientos-financieros]
  - [references, table--seguridad-usuarios]
  - [references, table--seguridad-usuarios]
  - [references, table--seguridad-usuarios]
  - [references, table--seguridad-usuarios]
  - [references, table--seguridad-usuarios]
terminos: [finanzas, ordenes, pago, concepto, importe, categoria, egreso, proveedor, caja, cuenta, bancaria, ejercicio, estado, solicitado, fecha, solicitud, autorizado, autorizacion, rechazado, rechazo, motivo, anulado, anulacion, movimiento, version, institucion, observacion, creado, actualizado]
---

# finanzas.ordenes_pago

Tabla finanzas.ordenes_pago (26 columnas). Creada en 051_finanzas_ordenes_pago.sql.

- **Esquema:** finanzas · **Columnas:** 26

## Llaves foraneas

- `categoria_egreso_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `proveedor_id` → [[table--deposito-proveedores|deposito.proveedores]]
- `caja_id` → [[table--finanzas-cajas|finanzas.cajas]]
- `cuenta_bancaria_id` → [[table--finanzas-cuentas-bancarias|finanzas.cuentas_bancarias]]
- `ejercicio_id` → [[table--finanzas-ejercicios-fiscales|finanzas.ejercicios_fiscales]]
- `movimiento_id` → [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]]
- `solicitado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `autorizado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `rechazado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `anulado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| concepto | NVARCHAR(300) |
| importe | DECIMAL(15,2) |
| categoria_egreso_id | UNIQUEIDENTIFIER |
| proveedor_id | UNIQUEIDENTIFIER |
| caja_id | UNIQUEIDENTIFIER |
| cuenta_bancaria_id | UNIQUEIDENTIFIER |
| ejercicio_id | UNIQUEIDENTIFIER |
| estado | NVARCHAR(30) |
| solicitado_por | UNIQUEIDENTIFIER |
| fecha_solicitud | DATETIMEOFFSET(3) |
| autorizado_por | UNIQUEIDENTIFIER |
| fecha_autorizacion | DATETIMEOFFSET(3) |
| rechazado_por | UNIQUEIDENTIFIER |
| fecha_rechazo | DATETIMEOFFSET(3) |
| motivo_rechazo | NVARCHAR(MAX) |
| anulado_por | UNIQUEIDENTIFIER |
| fecha_anulacion | DATETIMEOFFSET(3) |
| motivo_anulacion | NVARCHAR(MAX) |
| movimiento_id | UNIQUEIDENTIFIER |
| version | INT |
| institucion_id | UNIQUEIDENTIFIER |
| observacion | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** ConsultasFinanzasController, DashboardFinanzasController, OrdenesPagoController
- **Servicios:** ConsultasFinanzasService, DashboardFinanzasService, OrdenesPagoService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/051_finanzas_ordenes_pago.sql`

## Relaciones

- `defined_in` → [[file--051-finanzas-ordenes-pago|051_finanzas_ordenes_pago.sql]]
- `belongs_to` → [[domain--finanzas|Finanzas]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--deposito-proveedores|deposito.proveedores]]
- `references` → [[table--finanzas-cajas|finanzas.cajas]]
- `references` → [[table--finanzas-cuentas-bancarias|finanzas.cuentas_bancarias]]
- `references` → [[table--finanzas-ejercicios-fiscales|finanzas.ejercicios_fiscales]]
- `references` → [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--orden-pago|OrdenPago]] `persisted_in` →
- [[service--finanzas-consultas-finanzas|ConsultasFinanzasService]] `reads` →
- [[service--finanzas-dashboard-finanzas|DashboardFinanzasService]] `reads` →
- [[service--finanzas-ordenes-pago|OrdenesPagoService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
