---
id: entity--movimiento-bancario
tipo: ENTITY
nombre: MovimientoBancario
nivel: L1
dominio: finanzas
resumen: "Movimiento de extracto bancario (seccion 12) con conciliacion simple (seccion 13): comparar contra SIGBO y marcar Conciliado/Pendiente/Diferencia. Nunca se ajusta un movimiento automaticamente para hacerlo coincidir -- la diferencia queda visible."
tabla: finanzas.movimientos_bancarios
archivos:
  - backend/src/shared/entities/movimiento-bancario.entity.ts
edges:
  - [belongs_to, domain--finanzas]
  - [persisted_in, table--finanzas-movimientos-bancarios]
terminos: [movimiento, bancario, movimientos, bancarios, finanzas, tipo, deposito, transferencia, debito, credito, comision, otro, estado, conciliacion, pendiente, conciliado, diferencia]
---

# MovimientoBancario

Movimiento de extracto bancario (seccion 12) con conciliacion simple (seccion 13): comparar contra SIGBO y marcar Conciliado/Pendiente/Diferencia. Nunca se ajusta un movimiento automaticamente para hacerlo coincidir -- la diferencia queda visible.

- **Tabla:** [[table--finanzas-movimientos-bancarios|finanzas.movimientos_bancarios]]
- **Columnas mapeadas:** 11

## Estados y enumeraciones

- `TipoMovimientoBancario`: `DEPOSITO` · `TRANSFERENCIA` · `DEBITO` · `CREDITO` · `COMISION` · `OTRO`
- `EstadoConciliacion`: `PENDIENTE` · `CONCILIADO` · `DIFERENCIA`

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** MovimientosBancariosController
- **Servicios:** MovimientosBancariosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/movimiento-bancario.entity.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `persisted_in` → [[table--finanzas-movimientos-bancarios|finanzas.movimientos_bancarios]]

## Referenciado por

- [[service--finanzas-movimientos-bancarios|MovimientosBancariosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
