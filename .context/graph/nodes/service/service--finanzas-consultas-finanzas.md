---
id: service--finanzas-consultas-finanzas
tipo: SERVICE
nombre: ConsultasFinanzasService
nivel: L2
dominio: finanzas
resumen: Capa de consulta de SOLO LECTURA preparada para Snoopy (seccion 33 del pedido). Ningun metodo escribe nada. La IA hereda exactamente los permisos del usuario que consulta (RequirePermission del controller) -- nunca decide autorizacion por su cuenta, nunca registra movimientos, modifica importes, aprueba gastos, anula operaciones ni autoriza pagos.
capa: backend
archivos:
  - backend/src/modules/finanzas/consultas-finanzas.service.ts
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
  - [uses, entity--parametro]
  - [reads, table--organizacion-parametros]
terminos: [consultas, finanzas, caja, cuenta, bancaria, movimiento, financiero, orden, pago, parametro]
---

# ConsultasFinanzasService

Capa de consulta de SOLO LECTURA preparada para Snoopy (seccion 33 del pedido). Ningun metodo escribe nada. La IA hereda exactamente los permisos del usuario que consulta (RequirePermission del controller) -- nunca decide autorizacion por su cuenta, nunca registra movimientos, modifica importes, aprueba gastos, anula operaciones ni autoriza pagos.


## Metodos

`saldoDeCajas()` · `gastoPorCategoria()` · `ingresoPorTipo()` · `ordenesPendientes()`

## Archivos

- `backend/src/modules/finanzas/consultas-finanzas.service.ts`

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
- `uses` → [[entity--parametro|Parametro]]
- `reads` → [[table--organizacion-parametros|organizacion.parametros]]

## Referenciado por

- [[api--finanzas-consultas-finanzas|ConsultasFinanzasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
