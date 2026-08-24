---
id: table--finanzas-movimientos-bancarios
tipo: TABLE
nombre: finanzas.movimientos_bancarios
nivel: L2
dominio: finanzas
resumen: Tabla finanzas.movimientos_bancarios (13 columnas). Creada en 050_finanzas_bancos_presupuesto.sql.
tabla: movimientos_bancarios
archivos:
  - database/migrations/050_finanzas_bancos_presupuesto.sql
edges:
  - [defined_in, file--050-finanzas-bancos-presupuesto]
  - [belongs_to, domain--finanzas]
  - [references, table--finanzas-cuentas-bancarias]
  - [references, table--finanzas-movimientos-financieros]
  - [references, table--seguridad-usuarios]
  - [references, table--seguridad-usuarios]
terminos: [finanzas, movimientos, bancarios, cuenta, bancaria, tipo, fecha, importe, descripcion, movimiento, financiero, estado, conciliacion, conciliado, observacion, creado]
---

# finanzas.movimientos_bancarios

Tabla finanzas.movimientos_bancarios (13 columnas). Creada en 050_finanzas_bancos_presupuesto.sql.

- **Esquema:** finanzas · **Columnas:** 13

## Llaves foraneas

- `cuenta_bancaria_id` → [[table--finanzas-cuentas-bancarias|finanzas.cuentas_bancarias]]
- `movimiento_financiero_id` → [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]]
- `conciliado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| cuenta_bancaria_id | UNIQUEIDENTIFIER |
| tipo | NVARCHAR(20) |
| fecha | DATE |
| importe | DECIMAL(15,2) |
| descripcion | NVARCHAR(300) |
| movimiento_financiero_id | UNIQUEIDENTIFIER |
| estado_conciliacion | NVARCHAR(20) |
| fecha_conciliacion | DATETIMEOFFSET(3) |
| conciliado_por | UNIQUEIDENTIFIER |
| observacion | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** MovimientosBancariosController
- **Servicios:** MovimientosBancariosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/050_finanzas_bancos_presupuesto.sql`

## Relaciones

- `defined_in` → [[file--050-finanzas-bancos-presupuesto|050_finanzas_bancos_presupuesto.sql]]
- `belongs_to` → [[domain--finanzas|Finanzas]]
- `references` → [[table--finanzas-cuentas-bancarias|finanzas.cuentas_bancarias]]
- `references` → [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--movimiento-bancario|MovimientoBancario]] `persisted_in` →
- [[service--finanzas-movimientos-bancarios|MovimientosBancariosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
