---
id: component--front-finanzas
tipo: COMPONENT
nombre: finanzas
nivel: L2
dominio: finanzas
resumen: "Helper de frontend \"finanzas\" (69 exportaciones, consume 24 endpoint(s))."
capa: frontend
archivos:
  - frontend/src/lib/finanzas.ts
edges:
  - [calls, api--finanzas-ejercicios-fiscales]
  - [calls, api--finanzas-ejercicios-fiscales]
  - [calls, api--finanzas-cajas]
  - [calls, api--finanzas-cajas]
  - [calls, api--finanzas-cuentas-bancarias]
  - [calls, api--finanzas-cuentas-bancarias]
  - [calls, api--finanzas-movimientos-financieros]
  - [calls, api--finanzas-movimientos-financieros]
  - [calls, api--finanzas-movimientos-financieros]
  - [calls, api--finanzas-cuotas]
  - [calls, api--finanzas-cuotas]
  - [calls, api--finanzas-cuotas]
  - [calls, api--finanzas-movimientos-bancarios]
  - [calls, api--finanzas-movimientos-bancarios]
  - [calls, api--finanzas-movimientos-bancarios]
  - [calls, api--finanzas-presupuestos]
  - [calls, api--finanzas-presupuestos]
  - [calls, api--finanzas-presupuestos]
  - [calls, api--finanzas-ordenes-pago]
  - [calls, api--finanzas-ordenes-pago]
  - [calls, api--finanzas-dashboard-finanzas]
  - [calls, api--finanzas-integracion-finanzas]
  - [calls, api--finanzas-integracion-finanzas]
  - [calls, api--finanzas-reportes-finanzas]
terminos: [finanzas, cargar, tipos, ingreso, categorias, egreso, cuenta, bancaria, documento, motivos, anulacion, estado, ejercicio, fiscal, caja, turno, tipo, movimiento, financiero, respaldo, input, cuota]
---

# finanzas

Helper de frontend "finanzas" (69 exportaciones, consume 24 endpoint(s)).


## Archivos

- `frontend/src/lib/finanzas.ts`

## Relaciones

- `calls` → [[api--finanzas-ejercicios-fiscales|EjerciciosFiscalesController]]
- `calls` → [[api--finanzas-ejercicios-fiscales|EjerciciosFiscalesController]]
- `calls` → [[api--finanzas-cajas|CajasController]]
- `calls` → [[api--finanzas-cajas|CajasController]]
- `calls` → [[api--finanzas-cuentas-bancarias|CuentasBancariasController]]
- `calls` → [[api--finanzas-cuentas-bancarias|CuentasBancariasController]]
- `calls` → [[api--finanzas-movimientos-financieros|MovimientosFinancierosController]]
- `calls` → [[api--finanzas-movimientos-financieros|MovimientosFinancierosController]]
- `calls` → [[api--finanzas-movimientos-financieros|MovimientosFinancierosController]]
- `calls` → [[api--finanzas-cuotas|CuotasController]]
- `calls` → [[api--finanzas-cuotas|CuotasController]]
- `calls` → [[api--finanzas-cuotas|CuotasController]]
- `calls` → [[api--finanzas-movimientos-bancarios|MovimientosBancariosController]]
- `calls` → [[api--finanzas-movimientos-bancarios|MovimientosBancariosController]]
- `calls` → [[api--finanzas-movimientos-bancarios|MovimientosBancariosController]]
- `calls` → [[api--finanzas-presupuestos|PresupuestosController]]
- `calls` → [[api--finanzas-presupuestos|PresupuestosController]]
- `calls` → [[api--finanzas-presupuestos|PresupuestosController]]
- `calls` → [[api--finanzas-ordenes-pago|OrdenesPagoController]]
- `calls` → [[api--finanzas-ordenes-pago|OrdenesPagoController]]
- `calls` → [[api--finanzas-dashboard-finanzas|DashboardFinanzasController]]
- `calls` → [[api--finanzas-integracion-finanzas|IntegracionFinanzasController]]
- `calls` → [[api--finanzas-integracion-finanzas|IntegracionFinanzasController]]
- `calls` → [[api--finanzas-reportes-finanzas|ReportesFinanzasController]]

## Referenciado por

- [[screen--dashboard-finanzas-cajas|/dashboard/finanzas/cajas]] `uses` →
- [[screen--dashboard-finanzas-cuentas-bancarias|/dashboard/finanzas/cuentas-bancarias]] `uses` →
- [[screen--dashboard-finanzas-cuotas|/dashboard/finanzas/cuotas]] `uses` →
- [[screen--dashboard-finanzas-ejercicios-fiscales|/dashboard/finanzas/ejercicios-fiscales]] `uses` →
- [[screen--dashboard-finanzas-facturacion|/dashboard/finanzas/facturacion]] `uses` →
- [[screen--dashboard-finanzas-movimientos|/dashboard/finanzas/movimientos]] `uses` →
- [[screen--dashboard-finanzas-movimientos-bancarios|/dashboard/finanzas/movimientos-bancarios]] `uses` →
- [[screen--dashboard-finanzas-ordenes-pago|/dashboard/finanzas/ordenes-pago]] `uses` →
- [[screen--dashboard-finanzas|/dashboard/finanzas]] `uses` →
- [[screen--dashboard-finanzas-presupuesto|/dashboard/finanzas/presupuesto]] `uses` →
- [[screen--dashboard-finanzas-socios-protectores-id|/dashboard/finanzas/socios-protectores/[id]]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
