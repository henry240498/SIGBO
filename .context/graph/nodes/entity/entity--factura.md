---
id: entity--factura
tipo: ENTITY
nombre: Factura
nivel: L1
dominio: finanzas
resumen: "Registro de facturacion. `origen=MANUAL` es una factura fisica ya emitida por el cuartel que solo se registra en SIGBO (no se pretende que SIGBO la genero). `origen=SIGBO` queda preparado para emision propia a futuro, sin integracion fiscal real todavia (seccion 15-16 del pedido). La correccion de una factura NUNCA es destructiva: se hace via NotaCredito, jamas editando/eliminando esta fila."
tabla: finanzas.facturas
archivos:
  - backend/src/shared/entities/factura.entity.ts
edges:
  - [belongs_to, domain--finanzas]
  - [persisted_in, table--finanzas-facturas]
terminos: [factura, facturas, finanzas, origen, manual, sigbo, estado, emitida, anulada]
---

# Factura

Registro de facturacion. `origen=MANUAL` es una factura fisica ya emitida por el cuartel que solo se registra en SIGBO (no se pretende que SIGBO la genero). `origen=SIGBO` queda preparado para emision propia a futuro, sin integracion fiscal real todavia (seccion 15-16 del pedido). La correccion de una factura NUNCA es destructiva: se hace via NotaCredito, jamas editando/eliminando esta fila.

- **Tabla:** [[table--finanzas-facturas|finanzas.facturas]]
- **Columnas mapeadas:** 31

## Estados y enumeraciones

- `OrigenFactura`: `MANUAL` · `SIGBO`
- `EstadoFactura`: `EMITIDA` · `ANULADA`

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** DashboardFinanzasController, FacturasController, NotasCreditoController, SociosProtectoresController
- **Servicios:** DashboardFinanzasService, FacturasService, NotasCreditoService, SociosProtectoresService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/factura.entity.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `persisted_in` → [[table--finanzas-facturas|finanzas.facturas]]

## Referenciado por

- [[service--finanzas-dashboard-finanzas|DashboardFinanzasService]] `uses` →
- [[service--finanzas-facturas|FacturasService]] `uses` →
- [[service--finanzas-notas-credito|NotasCreditoService]] `uses` →
- [[service--finanzas-socios-protectores|SociosProtectoresService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
