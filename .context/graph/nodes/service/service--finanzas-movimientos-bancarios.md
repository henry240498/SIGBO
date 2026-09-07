---
id: service--finanzas-movimientos-bancarios
tipo: SERVICE
nombre: MovimientosBancariosService
nivel: L2
dominio: finanzas
resumen: "Extracto bancario cargado a mano en SIGBO (seccion 12) con conciliacion simple (seccion 13): nunca ajusta automaticamente un movimiento para hacerlo coincidir -- solo marca el estado, la diferencia queda visible para revision manual."
capa: backend
archivos:
  - backend/src/modules/finanzas/movimientos-bancarios.service.ts
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--modulo-finanzas]
  - [uses, entity--movimiento-bancario]
  - [reads, table--finanzas-movimientos-bancarios]
  - [uses, entity--cuenta-bancaria]
  - [reads, table--finanzas-cuentas-bancarias]
  - [uses, entity--movimiento-financiero]
  - [reads, table--finanzas-movimientos-financieros]
  - [uses, service--seguridad-auditoria]
terminos: [movimientos, bancarios, finanzas, movimiento, bancario, cuenta, bancaria, financiero]
---

# MovimientosBancariosService

Extracto bancario cargado a mano en SIGBO (seccion 12) con conciliacion simple (seccion 13): nunca ajusta automaticamente un movimiento para hacerlo coincidir -- solo marca el estado, la diferencia queda visible para revision manual.


## Metodos

`findAll()` · `findOne()` · `create()` · `conciliar()`

## Archivos

- `backend/src/modules/finanzas/movimientos-bancarios.service.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--modulo-finanzas|finanzas (modulo NestJS)]]
- `uses` → [[entity--movimiento-bancario|MovimientoBancario]]
- `reads` → [[table--finanzas-movimientos-bancarios|finanzas.movimientos_bancarios]]
- `uses` → [[entity--cuenta-bancaria|CuentaBancaria]]
- `reads` → [[table--finanzas-cuentas-bancarias|finanzas.cuentas_bancarias]]
- `uses` → [[entity--movimiento-financiero|MovimientoFinanciero]]
- `reads` → [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--finanzas-movimientos-bancarios|MovimientosBancariosController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
