---
id: service--finanzas-dashboard-finanzas
tipo: SERVICE
nombre: DashboardFinanzasService
nivel: L2
dominio: finanzas
resumen: "Indicadores de la pantalla principal de Finanzas (secciones 3 y 35 del pedido). Los numeros son siempre calculados en el momento, nunca cacheados/desincronizables. `sociosSinAporteEsteMes` es una definicion simple y literal (socio activo con acuerdo activo sin ningun aporte registrado en el mes) -- no se inventa una regla de \"cumplimiento\" institucional que no fue definida (seccion 39)."
capa: backend
archivos:
  - backend/src/modules/finanzas/dashboard-finanzas.service.ts
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--modulo-finanzas]
  - [uses, entity--caja]
  - [reads, table--finanzas-cajas]
  - [uses, entity--cuenta-bancaria]
  - [reads, table--finanzas-cuentas-bancarias]
  - [uses, entity--movimiento-financiero]
  - [reads, table--finanzas-movimientos-financieros]
  - [uses, entity--orden-pago]
  - [reads, table--finanzas-ordenes-pago]
  - [uses, entity--socio-protector]
  - [reads, table--finanzas-socios-protectores]
  - [uses, entity--acuerdo-aporte]
  - [reads, table--finanzas-acuerdos-aporte]
  - [uses, entity--aporte]
  - [reads, table--finanzas-aportes]
  - [uses, entity--factura]
  - [reads, table--finanzas-facturas]
  - [uses, entity--nota-credito]
  - [reads, table--finanzas-notas-credito]
  - [uses, entity--parametro]
  - [reads, table--organizacion-parametros]
terminos: [finanzas, caja, cuenta, bancaria, movimiento, financiero, orden, pago, socio, protector, acuerdo, aporte, factura, nota, credito, parametro]
---

# DashboardFinanzasService

Indicadores de la pantalla principal de Finanzas (secciones 3 y 35 del pedido). Los numeros son siempre calculados en el momento, nunca cacheados/desincronizables. `sociosSinAporteEsteMes` es una definicion simple y literal (socio activo con acuerdo activo sin ningun aporte registrado en el mes) -- no se inventa una regla de "cumplimiento" institucional que no fue definida (seccion 39).


## Metodos

`indicadores()`

## Archivos

- `backend/src/modules/finanzas/dashboard-finanzas.service.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--modulo-finanzas|finanzas (modulo NestJS)]]
- `uses` → [[entity--caja|Caja]]
- `reads` → [[table--finanzas-cajas|finanzas.cajas]]
- `uses` → [[entity--cuenta-bancaria|CuentaBancaria]]
- `reads` → [[table--finanzas-cuentas-bancarias|finanzas.cuentas_bancarias]]
- `uses` → [[entity--movimiento-financiero|MovimientoFinanciero]]
- `reads` → [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]]
- `uses` → [[entity--orden-pago|OrdenPago]]
- `reads` → [[table--finanzas-ordenes-pago|finanzas.ordenes_pago]]
- `uses` → [[entity--socio-protector|SocioProtector]]
- `reads` → [[table--finanzas-socios-protectores|finanzas.socios_protectores]]
- `uses` → [[entity--acuerdo-aporte|AcuerdoAporte]]
- `reads` → [[table--finanzas-acuerdos-aporte|finanzas.acuerdos_aporte]]
- `uses` → [[entity--aporte|Aporte]]
- `reads` → [[table--finanzas-aportes|finanzas.aportes]]
- `uses` → [[entity--factura|Factura]]
- `reads` → [[table--finanzas-facturas|finanzas.facturas]]
- `uses` → [[entity--nota-credito|NotaCredito]]
- `reads` → [[table--finanzas-notas-credito|finanzas.notas_credito]]
- `uses` → [[entity--parametro|Parametro]]
- `reads` → [[table--organizacion-parametros|organizacion.parametros]]

## Referenciado por

- [[api--finanzas-dashboard-finanzas|DashboardFinanzasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
