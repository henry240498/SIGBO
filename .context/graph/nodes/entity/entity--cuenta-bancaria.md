---
id: entity--cuenta-bancaria
tipo: ENTITY
nombre: CuentaBancaria
nivel: L1
dominio: finanzas
resumen: Cuenta bancaria institucional (seccion 11 del pedido). El controller la protege con un permiso de lectura mas estricto para no mostrar numero de cuenta a cualquier usuario -- ver CuentasBancariasController.
tabla: finanzas.cuentas_bancarias
archivos:
  - backend/src/shared/entities/cuenta-bancaria.entity.ts
edges:
  - [belongs_to, domain--finanzas]
  - [persisted_in, table--finanzas-cuentas-bancarias]
terminos: [cuenta, bancaria, cuentas, bancarias, finanzas, estado, activa, inactiva]
---

# CuentaBancaria

Cuenta bancaria institucional (seccion 11 del pedido). El controller la protege con un permiso de lectura mas estricto para no mostrar numero de cuenta a cualquier usuario -- ver CuentasBancariasController.

- **Tabla:** [[table--finanzas-cuentas-bancarias|finanzas.cuentas_bancarias]]
- **Columnas mapeadas:** 11

## Estados y enumeraciones

- `EstadoCuentaBancaria`: `ACTIVA` · `INACTIVA`

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** ConsultasFinanzasController, CuentasBancariasController, DashboardFinanzasController, MovimientosBancariosController, MovimientosFinancierosController, ReportesFinanzasController
- **Servicios:** ConsultasFinanzasService, CuentasBancariasService, DashboardFinanzasService, MovimientosBancariosService, MovimientosFinancierosService, ReportesFinanzasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/cuenta-bancaria.entity.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `persisted_in` → [[table--finanzas-cuentas-bancarias|finanzas.cuentas_bancarias]]

## Referenciado por

- [[service--finanzas-consultas-finanzas|ConsultasFinanzasService]] `uses` →
- [[service--finanzas-cuentas-bancarias|CuentasBancariasService]] `uses` →
- [[service--finanzas-dashboard-finanzas|DashboardFinanzasService]] `uses` →
- [[service--finanzas-movimientos-bancarios|MovimientosBancariosService]] `uses` →
- [[service--finanzas-movimientos-financieros|MovimientosFinancierosService]] `uses` →
- [[service--finanzas-reportes-finanzas|ReportesFinanzasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
