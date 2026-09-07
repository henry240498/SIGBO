---
id: entity--orden-pago
tipo: ENTITY
nombre: OrdenPago
nivel: L1
dominio: finanzas
resumen: "Solicitud de gasto (seccion 18 del pedido) que atraviesa BORRADOR -> SOLICITADO -> PENDIENTE_AUTORIZACION -> AUTORIZADO -> PAGADO, con ramas RECHAZADO/ANULADO -- mismo patron de maquina de estados que servicios.comunicaciones_servicio (permiso distinto por transicion, `version` para optimistic locking, ver OrdenesPagoService). Al pagarse genera el egreso real en `movimientoId` -- la orden es la autorizacion, el movimiento es el hecho economico consumado."
tabla: finanzas.ordenes_pago
archivos:
  - backend/src/shared/entities/orden-pago.entity.ts
edges:
  - [belongs_to, domain--finanzas]
  - [persisted_in, table--finanzas-ordenes-pago]
terminos: [orden, pago, ordenes, finanzas, estado, borrador, solicitado, pendiente, autorizacion, autorizado, rechazado, pagado, anulado]
---

# OrdenPago

Solicitud de gasto (seccion 18 del pedido) que atraviesa BORRADOR -> SOLICITADO -> PENDIENTE_AUTORIZACION -> AUTORIZADO -> PAGADO, con ramas RECHAZADO/ANULADO -- mismo patron de maquina de estados que servicios.comunicaciones_servicio (permiso distinto por transicion, `version` para optimistic locking, ver OrdenesPagoService). Al pagarse genera el egreso real en `movimientoId` -- la orden es la autorizacion, el movimiento es el hecho economico consumado.

- **Tabla:** [[table--finanzas-ordenes-pago|finanzas.ordenes_pago]]
- **Columnas mapeadas:** 23

## Estados y enumeraciones

- `EstadoOrdenPago`: `BORRADOR` · `SOLICITADO` · `PENDIENTE_AUTORIZACION` · `AUTORIZADO` · `RECHAZADO` · `PAGADO` · `ANULADO`

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** ConsultasFinanzasController, DashboardFinanzasController, OrdenesPagoController
- **Servicios:** ConsultasFinanzasService, DashboardFinanzasService, OrdenesPagoService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/orden-pago.entity.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `persisted_in` → [[table--finanzas-ordenes-pago|finanzas.ordenes_pago]]

## Referenciado por

- [[service--finanzas-consultas-finanzas|ConsultasFinanzasService]] `uses` →
- [[service--finanzas-dashboard-finanzas|DashboardFinanzasService]] `uses` →
- [[service--finanzas-ordenes-pago|OrdenesPagoService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
