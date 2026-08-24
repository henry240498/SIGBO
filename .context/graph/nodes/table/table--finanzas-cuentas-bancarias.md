---
id: table--finanzas-cuentas-bancarias
tipo: TABLE
nombre: finanzas.cuentas_bancarias
nivel: L2
dominio: finanzas
resumen: Tabla finanzas.cuentas_bancarias (14 columnas). Creada en 048_finanzas_estructura.sql.
tabla: cuentas_bancarias
archivos:
  - database/migrations/048_finanzas_estructura.sql
edges:
  - [defined_in, file--048-finanzas-estructura]
  - [belongs_to, domain--finanzas]
  - [references, table--organizacion-parametros]
  - [references, table--personal-bomberos]
terminos: [finanzas, cuentas, bancarias, banco, numero, cuenta, tipo, moneda, responsable, estado, saldo, actual, institucion, observacion, creado, actualizado]
---

# finanzas.cuentas_bancarias

Tabla finanzas.cuentas_bancarias (14 columnas). Creada en 048_finanzas_estructura.sql.

- **Esquema:** finanzas · **Columnas:** 14
- **UNIQUE:** `banco, numero_cuenta`

## Llaves foraneas

- `tipo_cuenta_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `responsable_id` → [[table--personal-bomberos|personal.bomberos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| banco | NVARCHAR(150) |
| numero_cuenta | NVARCHAR(50) |
| tipo_cuenta_id | UNIQUEIDENTIFIER |
| moneda | NVARCHAR(3) |
| responsable_id | UNIQUEIDENTIFIER |
| estado | NVARCHAR(20) |
| saldo_actual | DECIMAL(15,2) |
| institucion_id | UNIQUEIDENTIFIER |
| observacion | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** ConsultasFinanzasController, CuentasBancariasController, DashboardFinanzasController, MovimientosBancariosController, MovimientosFinancierosController, ReportesFinanzasController
- **Servicios:** ConsultasFinanzasService, CuentasBancariasService, DashboardFinanzasService, MovimientosBancariosService, MovimientosFinancierosService, ReportesFinanzasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/048_finanzas_estructura.sql`

## Relaciones

- `defined_in` → [[file--048-finanzas-estructura|048_finanzas_estructura.sql]]
- `belongs_to` → [[domain--finanzas|Finanzas]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--personal-bomberos|personal.bomberos]]

## Referenciado por

- [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]] `references` →
- [[table--finanzas-movimientos-bancarios|finanzas.movimientos_bancarios]] `references` →
- [[table--finanzas-ordenes-pago|finanzas.ordenes_pago]] `references` →
- [[table--finanzas-aportes|finanzas.aportes]] `references` →
- [[entity--cuenta-bancaria|CuentaBancaria]] `persisted_in` →
- [[service--finanzas-consultas-finanzas|ConsultasFinanzasService]] `reads` →
- [[service--finanzas-cuentas-bancarias|CuentasBancariasService]] `reads` →
- [[service--finanzas-dashboard-finanzas|DashboardFinanzasService]] `reads` →
- [[service--finanzas-movimientos-bancarios|MovimientosBancariosService]] `reads` →
- [[service--finanzas-movimientos-financieros|MovimientosFinancierosService]] `reads` →
- [[service--finanzas-reportes-finanzas|ReportesFinanzasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
