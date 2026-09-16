---
id: table--finanzas-aportes
tipo: TABLE
nombre: finanzas.aportes
nivel: L2
dominio: finanzas
resumen: Tabla finanzas.aportes (25 columnas). Creada en 063_finanzas_acuerdos_aportes.sql, modificada por 065_finanzas_facturacion.sql.
tabla: aportes
archivos:
  - database/migrations/063_finanzas_acuerdos_aportes.sql
  - database/migrations/065_finanzas_facturacion.sql
edges:
  - [defined_in, file--063-finanzas-acuerdos-aportes]
  - [belongs_to, domain--finanzas]
  - [references, table--finanzas-socios-protectores]
  - [references, table--finanzas-acuerdos-aporte]
  - [references, table--organizacion-parametros]
  - [references, table--finanzas-cajas]
  - [references, table--finanzas-cuentas-bancarias]
  - [references, table--finanzas-movimientos-financieros]
  - [references, table--seguridad-usuarios]
  - [references, table--seguridad-usuarios]
terminos: [finanzas, aportes, socio, protector, acuerdo, aporte, extraordinario, fecha, hora, monto, moneda, periodo, correspondiente, concepto, medio, pago, numero, comprobante, caja, cuenta, bancaria, archivo, url, movimiento, financiero, estado, anulado, anulacion, motivo, observaciones, institucion, creado, factura]
---

# finanzas.aportes

Tabla finanzas.aportes (25 columnas). Creada en 063_finanzas_acuerdos_aportes.sql, modificada por 065_finanzas_facturacion.sql.

- **Esquema:** finanzas · **Columnas:** 25

## Llaves foraneas

- `socio_protector_id` → [[table--finanzas-socios-protectores|finanzas.socios_protectores]]
- `acuerdo_aporte_id` → [[table--finanzas-acuerdos-aporte|finanzas.acuerdos_aporte]]
- `medio_pago_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `caja_id` → [[table--finanzas-cajas|finanzas.cajas]]
- `cuenta_bancaria_id` → [[table--finanzas-cuentas-bancarias|finanzas.cuentas_bancarias]]
- `movimiento_financiero_id` → [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]]
- `anulado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| socio_protector_id | UNIQUEIDENTIFIER |
| acuerdo_aporte_id | UNIQUEIDENTIFIER |
| es_extraordinario | BIT |
| fecha | DATE |
| hora | TIME(0) |
| monto | DECIMAL(15,2) |
| moneda | NVARCHAR(3) |
| periodo_correspondiente | CHAR(7) |
| concepto | NVARCHAR(300) |
| medio_pago_id | UNIQUEIDENTIFIER |
| numero_comprobante | NVARCHAR(100) |
| caja_id | UNIQUEIDENTIFIER |
| cuenta_bancaria_id | UNIQUEIDENTIFIER |
| archivo_url | NVARCHAR(MAX) |
| movimiento_financiero_id | UNIQUEIDENTIFIER |
| estado | NVARCHAR(20) |
| anulado_por | UNIQUEIDENTIFIER |
| fecha_anulacion | DATETIMEOFFSET(3) |
| motivo_anulacion | NVARCHAR(MAX) |
| observaciones | NVARCHAR(MAX) |
| institucion_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| factura_id | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** AportesController, DashboardFinanzasController, FacturasController, SociosProtectoresController
- **Servicios:** AportesService, DashboardFinanzasService, FacturasService, SociosProtectoresService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/063_finanzas_acuerdos_aportes.sql`
- `database/migrations/065_finanzas_facturacion.sql`

## Relaciones

- `defined_in` → [[file--063-finanzas-acuerdos-aportes|063_finanzas_acuerdos_aportes.sql]]
- `belongs_to` → [[domain--finanzas|Finanzas]]
- `references` → [[table--finanzas-socios-protectores|finanzas.socios_protectores]]
- `references` → [[table--finanzas-acuerdos-aporte|finanzas.acuerdos_aporte]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--finanzas-cajas|finanzas.cajas]]
- `references` → [[table--finanzas-cuentas-bancarias|finanzas.cuentas_bancarias]]
- `references` → [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[table--finanzas-facturas|finanzas.facturas]] `references` →
- [[entity--aporte|Aporte]] `persisted_in` →
- [[service--finanzas-aportes|AportesService]] `reads` →
- [[service--finanzas-dashboard-finanzas|DashboardFinanzasService]] `reads` →
- [[service--finanzas-facturas|FacturasService]] `reads` →
- [[service--finanzas-socios-protectores|SociosProtectoresService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
