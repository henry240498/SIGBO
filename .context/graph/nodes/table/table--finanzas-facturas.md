---
id: table--finanzas-facturas
tipo: TABLE
nombre: finanzas.facturas
nivel: L2
dominio: finanzas
resumen: Tabla finanzas.facturas (34 columnas). Creada en 065_finanzas_facturacion.sql.
tabla: facturas
archivos:
  - database/migrations/065_finanzas_facturacion.sql
edges:
  - [defined_in, file--065-finanzas-facturacion]
  - [belongs_to, domain--finanzas]
  - [references, table--organizacion-parametros]
  - [references, table--finanzas-socios-protectores]
  - [references, table--organizacion-parametros]
  - [references, table--finanzas-aportes]
  - [references, table--academia-inscripciones]
  - [references, table--finanzas-movimientos-financieros]
  - [references, table--seguridad-usuarios]
  - [references, table--seguridad-usuarios]
terminos: [finanzas, facturas, origen, tipo, comprobante, numero, establecimiento, punto, expedicion, serie, timbrado, fecha, socio, protector, cliente, nombre, ruc, concepto, detalle, cantidad, precio, unitario, descuento, impuestos, total, moneda, forma, pago, aporte, inscripcion, academia, archivo, url, estado, anulado, anulacion, motivo, movimiento, financiero, institucion]
---

# finanzas.facturas

Tabla finanzas.facturas (34 columnas). Creada en 065_finanzas_facturacion.sql.

- **Esquema:** finanzas · **Columnas:** 34
- **UNIQUE:** `numero, timbrado, establecimiento, punto_expedicion`

## Llaves foraneas

- `tipo_comprobante_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `socio_protector_id` → [[table--finanzas-socios-protectores|finanzas.socios_protectores]]
- `forma_pago_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `aporte_id` → [[table--finanzas-aportes|finanzas.aportes]]
- `inscripcion_academia_id` → [[table--academia-inscripciones|academia.inscripciones]]
- `movimiento_financiero_id` → [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]]
- `anulado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| origen | NVARCHAR(10) |
| tipo_comprobante_id | UNIQUEIDENTIFIER |
| numero | NVARCHAR(50) |
| establecimiento | NVARCHAR(3) |
| punto_expedicion | NVARCHAR(3) |
| serie | NVARCHAR(10) |
| timbrado | NVARCHAR(20) |
| fecha | DATE |
| socio_protector_id | UNIQUEIDENTIFIER |
| cliente_nombre | NVARCHAR(200) |
| cliente_ruc_ci | NVARCHAR(30) |
| concepto | NVARCHAR(300) |
| detalle | NVARCHAR(MAX) |
| cantidad | DECIMAL(10,2) |
| precio_unitario | DECIMAL(15,2) |
| descuento | DECIMAL(15,2) |
| impuestos | DECIMAL(15,2) |
| total | DECIMAL(15,2) |
| moneda | NVARCHAR(3) |
| forma_pago_id | UNIQUEIDENTIFIER |
| aporte_id | UNIQUEIDENTIFIER |
| inscripcion_academia_id | UNIQUEIDENTIFIER |
| archivo_url | NVARCHAR(MAX) |
| estado | NVARCHAR(20) |
| anulado_por | UNIQUEIDENTIFIER |
| fecha_anulacion | DATETIMEOFFSET(3) |
| motivo_anulacion | NVARCHAR(MAX) |
| movimiento_financiero_id | UNIQUEIDENTIFIER |
| institucion_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** DashboardFinanzasController, FacturasController, NotasCreditoController, SociosProtectoresController
- **Servicios:** DashboardFinanzasService, FacturasService, NotasCreditoService, SociosProtectoresService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/065_finanzas_facturacion.sql`

## Relaciones

- `defined_in` → [[file--065-finanzas-facturacion|065_finanzas_facturacion.sql]]
- `belongs_to` → [[domain--finanzas|Finanzas]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--finanzas-socios-protectores|finanzas.socios_protectores]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--finanzas-aportes|finanzas.aportes]]
- `references` → [[table--academia-inscripciones|academia.inscripciones]]
- `references` → [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[table--finanzas-notas-credito|finanzas.notas_credito]] `references` →
- [[entity--factura|Factura]] `persisted_in` →
- [[service--finanzas-dashboard-finanzas|DashboardFinanzasService]] `reads` →
- [[service--finanzas-facturas|FacturasService]] `reads` →
- [[service--finanzas-notas-credito|NotasCreditoService]] `reads` →
- [[service--finanzas-socios-protectores|SociosProtectoresService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
