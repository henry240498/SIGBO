---
id: table--finanzas-cajas
tipo: TABLE
nombre: finanzas.cajas
nivel: L2
dominio: finanzas
resumen: Tabla finanzas.cajas (12 columnas). Creada en 048_finanzas_estructura.sql.
tabla: cajas
archivos:
  - database/migrations/048_finanzas_estructura.sql
edges:
  - [defined_in, file--048-finanzas-estructura]
  - [belongs_to, domain--finanzas]
  - [references, table--personal-bomberos]
terminos: [finanzas, cajas, nombre, responsable, estado, saldo, actual, moneda, institucion, observacion, creado, actualizado]
---

# finanzas.cajas

Tabla finanzas.cajas (12 columnas). Creada en 048_finanzas_estructura.sql.

- **Esquema:** finanzas · **Columnas:** 12

## Llaves foraneas

- `responsable_id` → [[table--personal-bomberos|personal.bomberos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| nombre | NVARCHAR(150) |
| responsable_id | UNIQUEIDENTIFIER |
| estado | NVARCHAR(20) |
| saldo_actual | DECIMAL(15,2) |
| moneda | NVARCHAR(3) |
| institucion_id | UNIQUEIDENTIFIER |
| observacion | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** CajasController, ConsultasFinanzasController, DashboardFinanzasController, MovimientosFinancierosController, ReportesFinanzasController
- **Servicios:** CajasService, ConsultasFinanzasService, DashboardFinanzasService, MovimientosFinancierosService, ReportesFinanzasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/048_finanzas_estructura.sql`

## Relaciones

- `defined_in` → [[file--048-finanzas-estructura|048_finanzas_estructura.sql]]
- `belongs_to` → [[domain--finanzas|Finanzas]]
- `references` → [[table--personal-bomberos|personal.bomberos]]

## Referenciado por

- [[table--finanzas-turnos-caja|finanzas.turnos_caja]] `references` →
- [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]] `references` →
- [[table--finanzas-ordenes-pago|finanzas.ordenes_pago]] `references` →
- [[table--finanzas-aportes|finanzas.aportes]] `references` →
- [[entity--caja|Caja]] `persisted_in` →
- [[service--finanzas-cajas|CajasService]] `reads` →
- [[service--finanzas-consultas-finanzas|ConsultasFinanzasService]] `reads` →
- [[service--finanzas-dashboard-finanzas|DashboardFinanzasService]] `reads` →
- [[service--finanzas-movimientos-financieros|MovimientosFinancierosService]] `reads` →
- [[service--finanzas-reportes-finanzas|ReportesFinanzasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
