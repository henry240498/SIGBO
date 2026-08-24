---
id: entity--movimiento-financiero
tipo: ENTITY
nombre: MovimientoFinanciero
nivel: L1
dominio: finanzas
resumen: "Ledger central de Finanzas (seccion 2 del pedido): cada fila es un hecho economico consumado. Nunca se edita el importe de una fila ya registrada -- se anula (estado + motivo + usuario + fecha, seccion 20) y se carga un movimiento nuevo si corresponde. El saldo de una caja/cuenta siempre es reconstruible sumando este historial, nunca un numero suelto."
tabla: finanzas.movimientos_financieros
archivos:
  - backend/src/shared/entities/movimiento-financiero.entity.ts
edges:
  - [belongs_to, domain--finanzas]
  - [persisted_in, table--finanzas-movimientos-financieros]
terminos: [movimiento, financiero, movimientos, financieros, finanzas, tipo, ingreso, egreso, estado, registrado, anulado]
---

# MovimientoFinanciero

Ledger central de Finanzas (seccion 2 del pedido): cada fila es un hecho economico consumado. Nunca se edita el importe de una fila ya registrada -- se anula (estado + motivo + usuario + fecha, seccion 20) y se carga un movimiento nuevo si corresponde. El saldo de una caja/cuenta siempre es reconstruible sumando este historial, nunca un numero suelto.

- **Tabla:** [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]]
- **Columnas mapeadas:** 29

## Estados y enumeraciones

- `TipoMovimientoFinanciero`: `INGRESO` · `EGRESO`
- `EstadoMovimientoFinanciero`: `REGISTRADO` · `ANULADO`

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** ConsultasFinanzasController, DashboardFinanzasController, IntegracionFinanzasController, MovimientosBancariosController, MovimientosFinancierosController, PresupuestosController, ReportesFinanzasController, SociosProtectoresController
- **Servicios:** ConsultasFinanzasService, DashboardFinanzasService, IaToolsService, IntegracionFinanzasService, MovimientosBancariosService, MovimientosFinancierosService, PresupuestosService, ReportesFinanzasService, SociosProtectoresService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/movimiento-financiero.entity.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `persisted_in` → [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]]

## Referenciado por

- [[service--finanzas-consultas-finanzas|ConsultasFinanzasService]] `uses` →
- [[service--finanzas-dashboard-finanzas|DashboardFinanzasService]] `uses` →
- [[service--finanzas-integracion-finanzas|IntegracionFinanzasService]] `uses` →
- [[service--finanzas-movimientos-bancarios|MovimientosBancariosService]] `uses` →
- [[service--finanzas-movimientos-financieros|MovimientosFinancierosService]] `uses` →
- [[service--finanzas-presupuestos|PresupuestosService]] `uses` →
- [[service--finanzas-reportes-finanzas|ReportesFinanzasService]] `uses` →
- [[service--finanzas-socios-protectores|SociosProtectoresService]] `uses` →
- [[service--ia-ia-tools|IaToolsService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
