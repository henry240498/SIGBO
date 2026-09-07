---
id: entity--caja
tipo: ENTITY
nombre: Caja
nivel: L1
dominio: finanzas
resumen: "Caja fisica de efectivo (seccion 4 del pedido) -- puede haber varias (Caja General, Caja de Eventos, etc). `saldoActual` es el saldo vigente, mantenido exclusivamente por MovimientosFinancierosService al registrar/anular un movimiento (nunca se edita a mano)."
tabla: finanzas.cajas
archivos:
  - backend/src/shared/entities/caja.entity.ts
edges:
  - [belongs_to, domain--finanzas]
  - [persisted_in, table--finanzas-cajas]
terminos: [caja, cajas, finanzas, estado, activa, inactiva]
---

# Caja

Caja fisica de efectivo (seccion 4 del pedido) -- puede haber varias (Caja General, Caja de Eventos, etc). `saldoActual` es el saldo vigente, mantenido exclusivamente por MovimientosFinancierosService al registrar/anular un movimiento (nunca se edita a mano).

- **Tabla:** [[table--finanzas-cajas|finanzas.cajas]]
- **Columnas mapeadas:** 9

## Estados y enumeraciones

- `EstadoCaja`: `ACTIVA` · `INACTIVA`

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** CajasController, ConsultasFinanzasController, DashboardFinanzasController, MovimientosFinancierosController, ReportesFinanzasController
- **Servicios:** CajasService, ConsultasFinanzasService, DashboardFinanzasService, MovimientosFinancierosService, ReportesFinanzasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/caja.entity.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `persisted_in` → [[table--finanzas-cajas|finanzas.cajas]]

## Referenciado por

- [[service--finanzas-cajas|CajasService]] `uses` →
- [[service--finanzas-consultas-finanzas|ConsultasFinanzasService]] `uses` →
- [[service--finanzas-dashboard-finanzas|DashboardFinanzasService]] `uses` →
- [[service--finanzas-movimientos-financieros|MovimientosFinancierosService]] `uses` →
- [[service--finanzas-reportes-finanzas|ReportesFinanzasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
