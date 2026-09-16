---
id: table--finanzas-movimientos-financieros
tipo: TABLE
nombre: finanzas.movimientos_financieros
nivel: L2
dominio: finanzas
resumen: Tabla finanzas.movimientos_financieros (31 columnas). Creada en 049_finanzas_movimientos.sql, modificada por 049_finanzas_movimientos.sql, 051_finanzas_ordenes_pago.sql, 063_finanzas_acuerdos_aportes.sql, 065_finanzas_facturacion.sql.
tabla: movimientos_financieros
archivos:
  - database/migrations/049_finanzas_movimientos.sql
  - database/migrations/051_finanzas_ordenes_pago.sql
  - database/migrations/063_finanzas_acuerdos_aportes.sql
  - database/migrations/065_finanzas_facturacion.sql
edges:
  - [defined_in, file--049-finanzas-movimientos]
  - [belongs_to, domain--finanzas]
  - [references, table--organizacion-parametros]
  - [references, table--organizacion-parametros]
  - [references, table--finanzas-cajas]
  - [references, table--finanzas-cuentas-bancarias]
  - [references, table--finanzas-turnos-caja]
  - [references, table--deposito-proveedores]
  - [references, table--personal-bomberos]
  - [references, table--personal-bomberos]
  - [references, table--deposito-entradas]
  - [references, table--finanzas-ejercicios-fiscales]
  - [references, table--organizacion-parametros]
  - [references, table--seguridad-usuarios]
  - [references, table--seguridad-usuarios]
terminos: [finanzas, movimientos, financieros, tipo, fecha, ingreso, categoria, egreso, concepto, importe, moneda, caja, cuenta, bancaria, turno, proveedor, bombero, entidad, externa, responsable, cuota, orden, pago, deposito, entrada, ejercicio, observacion, estado, anulado, anulacion, motivo, detalle, institucion, creado, socio, protector, aporte, factura]
---

# finanzas.movimientos_financieros

Tabla finanzas.movimientos_financieros (31 columnas). Creada en 049_finanzas_movimientos.sql, modificada por 049_finanzas_movimientos.sql, 051_finanzas_ordenes_pago.sql, 063_finanzas_acuerdos_aportes.sql, 065_finanzas_facturacion.sql.

- **Esquema:** finanzas · **Columnas:** 31

## Restricciones CHECK (reglas que la BD impone)

- `tipo IN (N'INGRESO', N'EGRESO')), CONSTRAINT CK_movf_estado CHECK (estado IN (N'REGISTRADO', N'ANULADO')), CONSTRAINT CK_movf_importe CHECK (importe > 0), CONSTRAINT CK_movf_origen CHECK ( (caja_id IS NOT NULL AND cuenta_bancaria_id IS NULL) OR (caja_id IS NULL AND cuenta_bancaria_id IS NOT NULL`
- `(tipo = N'INGRESO' AND tipo_ingreso_id IS NOT NULL AND categoria_egreso_id IS NULL) OR (tipo = N'EGRESO' AND categoria_egreso_id IS NOT NULL AND tipo_ingreso_id IS NULL`

## Llaves foraneas

- `tipo_ingreso_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `categoria_egreso_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `caja_id` → [[table--finanzas-cajas|finanzas.cajas]]
- `cuenta_bancaria_id` → [[table--finanzas-cuentas-bancarias|finanzas.cuentas_bancarias]]
- `turno_caja_id` → [[table--finanzas-turnos-caja|finanzas.turnos_caja]]
- `proveedor_id` → [[table--deposito-proveedores|deposito.proveedores]]
- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]
- `responsable_id` → [[table--personal-bomberos|personal.bomberos]]
- `deposito_entrada_id` → [[table--deposito-entradas|deposito.entradas]]
- `ejercicio_id` → [[table--finanzas-ejercicios-fiscales|finanzas.ejercicios_fiscales]]
- `motivo_anulacion_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `anulado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| tipo | NVARCHAR(10) |
| fecha | DATE |
| tipo_ingreso_id | UNIQUEIDENTIFIER |
| categoria_egreso_id | UNIQUEIDENTIFIER |
| concepto | NVARCHAR(300) |
| importe | DECIMAL(15,2) |
| moneda | NVARCHAR(3) |
| caja_id | UNIQUEIDENTIFIER |
| cuenta_bancaria_id | UNIQUEIDENTIFIER |
| turno_caja_id | UNIQUEIDENTIFIER |
| proveedor_id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| entidad_externa | NVARCHAR(300) |
| responsable_id | UNIQUEIDENTIFIER |
| cuota_id | UNIQUEIDENTIFIER |
| orden_pago_id | UNIQUEIDENTIFIER |
| deposito_entrada_id | UNIQUEIDENTIFIER |
| ejercicio_id | UNIQUEIDENTIFIER |
| observacion | NVARCHAR(MAX) |
| estado | NVARCHAR(20) |
| anulado_por | UNIQUEIDENTIFIER |
| fecha_anulacion | DATETIMEOFFSET(3) |
| motivo_anulacion_id | UNIQUEIDENTIFIER |
| motivo_anulacion_detalle | NVARCHAR(MAX) |
| institucion_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| socio_protector_id | UNIQUEIDENTIFIER |
| aporte_id | UNIQUEIDENTIFIER |
| factura_id | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** ConsultasFinanzasController, DashboardFinanzasController, IntegracionFinanzasController, MovimientosBancariosController, MovimientosFinancierosController, PresupuestosController, ReportesFinanzasController, SociosProtectoresController
- **Servicios:** ConsultasFinanzasService, DashboardFinanzasService, IaToolsService, IntegracionFinanzasService, MovimientosBancariosService, MovimientosFinancierosService, PresupuestosService, ReportesFinanzasService, SociosProtectoresService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/049_finanzas_movimientos.sql`
- `database/migrations/051_finanzas_ordenes_pago.sql`
- `database/migrations/063_finanzas_acuerdos_aportes.sql`
- `database/migrations/065_finanzas_facturacion.sql`

## Relaciones

- `defined_in` → [[file--049-finanzas-movimientos|049_finanzas_movimientos.sql]]
- `belongs_to` → [[domain--finanzas|Finanzas]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--finanzas-cajas|finanzas.cajas]]
- `references` → [[table--finanzas-cuentas-bancarias|finanzas.cuentas_bancarias]]
- `references` → [[table--finanzas-turnos-caja|finanzas.turnos_caja]]
- `references` → [[table--deposito-proveedores|deposito.proveedores]]
- `references` → [[table--personal-bomberos|personal.bomberos]]
- `references` → [[table--personal-bomberos|personal.bomberos]]
- `references` → [[table--deposito-entradas|deposito.entradas]]
- `references` → [[table--finanzas-ejercicios-fiscales|finanzas.ejercicios_fiscales]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[table--finanzas-documentos-respaldo|finanzas.documentos_respaldo]] `references` →
- [[table--finanzas-cuotas|finanzas.cuotas]] `references` →
- [[table--finanzas-movimientos-bancarios|finanzas.movimientos_bancarios]] `references` →
- [[table--finanzas-ordenes-pago|finanzas.ordenes_pago]] `references` →
- [[table--finanzas-aportes|finanzas.aportes]] `references` →
- [[table--finanzas-facturas|finanzas.facturas]] `references` →
- [[entity--movimiento-financiero|MovimientoFinanciero]] `persisted_in` →
- [[service--finanzas-consultas-finanzas|ConsultasFinanzasService]] `reads` →
- [[service--finanzas-dashboard-finanzas|DashboardFinanzasService]] `reads` →
- [[service--finanzas-integracion-finanzas|IntegracionFinanzasService]] `reads` →
- [[service--finanzas-movimientos-bancarios|MovimientosBancariosService]] `reads` →
- [[service--finanzas-movimientos-financieros|MovimientosFinancierosService]] `reads` →
- [[service--finanzas-presupuestos|PresupuestosService]] `reads` →
- [[service--finanzas-reportes-finanzas|ReportesFinanzasService]] `reads` →
- [[service--finanzas-socios-protectores|SociosProtectoresService]] `reads` →
- [[service--ia-ia-tools|IaToolsService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
