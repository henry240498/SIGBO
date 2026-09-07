---
id: service--finanzas-integracion-finanzas
tipo: SERVICE
nombre: IntegracionFinanzasService
nivel: L2
dominio: finanzas
resumen: "Integracion con Deposito (secciones 16-17 del pedido): cuando Deposito registra una compra o una donacion, Finanzas puede generar el movimiento monetario correspondiente SIN reingresar los items -- solo referencia deposito.entradas.id (`depositoEntradaId`). Nunca duplica la ficha de proveedor ni el detalle de items, que siguen viviendo exclusivamente en Deposito."
capa: backend
archivos:
  - backend/src/modules/finanzas/integracion-finanzas.service.ts
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--modulo-finanzas]
  - [uses, entity--entrada-deposito]
  - [reads, table--deposito-entradas]
  - [uses, entity--parametro]
  - [reads, table--organizacion-parametros]
  - [uses, entity--movimiento-financiero]
  - [reads, table--finanzas-movimientos-financieros]
  - [uses, service--finanzas-movimientos-financieros]
terminos: [integracion, finanzas, entrada, deposito, parametro, movimiento, financiero]
---

# IntegracionFinanzasService

Integracion con Deposito (secciones 16-17 del pedido): cuando Deposito registra una compra o una donacion, Finanzas puede generar el movimiento monetario correspondiente SIN reingresar los items -- solo referencia deposito.entradas.id (`depositoEntradaId`). Nunca duplica la ficha de proveedor ni el detalle de items, que siguen viviendo exclusivamente en Deposito.


## Metodos

`entradasSinRegistrarEnFinanzas()` · `registrarDesdeEntradaDeposito()`

## Archivos

- `backend/src/modules/finanzas/integracion-finanzas.service.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--modulo-finanzas|finanzas (modulo NestJS)]]
- `uses` → [[entity--entrada-deposito|EntradaDeposito]]
- `reads` → [[table--deposito-entradas|deposito.entradas]]
- `uses` → [[entity--parametro|Parametro]]
- `reads` → [[table--organizacion-parametros|organizacion.parametros]]
- `uses` → [[entity--movimiento-financiero|MovimientoFinanciero]]
- `reads` → [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]]
- `uses` → [[service--finanzas-movimientos-financieros|MovimientosFinancierosService]]

## Referenciado por

- [[api--finanzas-integracion-finanzas|IntegracionFinanzasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
