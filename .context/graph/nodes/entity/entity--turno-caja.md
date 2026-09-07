---
id: entity--turno-caja
tipo: ENTITY
nombre: TurnoCaja
nivel: L1
dominio: finanzas
resumen: "Sesion de apertura/cierre de una caja (seccion 5 del pedido). Solo puede haber un turno ABIERTO por caja a la vez (indice unico filtrado en la migracion). El cierre calcula `diferencia` = saldoFisico - saldoTeorico; si no es cero queda registrada, nunca se ajusta silenciosamente."
tabla: finanzas.turnos_caja
archivos:
  - backend/src/shared/entities/turno-caja.entity.ts
edges:
  - [belongs_to, domain--finanzas]
  - [persisted_in, table--finanzas-turnos-caja]
terminos: [turno, caja, turnos, finanzas, estado, abierto, cerrado]
---

# TurnoCaja

Sesion de apertura/cierre de una caja (seccion 5 del pedido). Solo puede haber un turno ABIERTO por caja a la vez (indice unico filtrado en la migracion). El cierre calcula `diferencia` = saldoFisico - saldoTeorico; si no es cero queda registrada, nunca se ajusta silenciosamente.

- **Tabla:** [[table--finanzas-turnos-caja|finanzas.turnos_caja]]
- **Columnas mapeadas:** 11

## Estados y enumeraciones

- `EstadoTurnoCaja`: `ABIERTO` · `CERRADO`

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** CajasController, MovimientosFinancierosController, ReportesFinanzasController
- **Servicios:** CajasService, MovimientosFinancierosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/turno-caja.entity.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `persisted_in` → [[table--finanzas-turnos-caja|finanzas.turnos_caja]]

## Referenciado por

- [[service--finanzas-cajas|CajasService]] `uses` →
- [[service--finanzas-movimientos-financieros|MovimientosFinancierosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
