---
id: service--finanzas-movimientos-financieros
tipo: SERVICE
nombre: MovimientosFinancierosService
nivel: L2
dominio: finanzas
resumen: "Motor central de trazabilidad de Finanzas (seccion 2 del pedido): cada movimiento crea SIEMPRE una fila de historial (finanzas.movimientos_financieros) y actualiza el saldo de la caja/cuenta en la misma transaccion -- nunca se edita un saldo por fuera de este flujo. El importe de un movimiento ya registrado nunca se edita: se anula (estado + motivo + usuario + fecha) y revierte el saldo."
capa: backend
archivos:
  - backend/src/modules/finanzas/movimientos-financieros.service.ts
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--modulo-finanzas]
  - [uses, entity--movimiento-financiero]
  - [reads, table--finanzas-movimientos-financieros]
  - [uses, entity--caja]
  - [reads, table--finanzas-cajas]
  - [uses, entity--cuenta-bancaria]
  - [reads, table--finanzas-cuentas-bancarias]
  - [uses, entity--turno-caja]
  - [reads, table--finanzas-turnos-caja]
  - [uses, entity--documento-respaldo]
  - [reads, table--finanzas-documentos-respaldo]
  - [uses, entity--parametro]
  - [reads, table--organizacion-parametros]
  - [uses, service--finanzas-ejercicios-fiscales]
  - [uses, service--seguridad-auditoria]
terminos: [movimientos, financieros, finanzas, movimiento, financiero, caja, cuenta, bancaria, turno, documento, respaldo, parametro]
---

# MovimientosFinancierosService

Motor central de trazabilidad de Finanzas (seccion 2 del pedido): cada movimiento crea SIEMPRE una fila de historial (finanzas.movimientos_financieros) y actualiza el saldo de la caja/cuenta en la misma transaccion -- nunca se edita un saldo por fuera de este flujo. El importe de un movimiento ya registrado nunca se edita: se anula (estado + motivo + usuario + fecha) y revierte el saldo.


## Metodos

`filasExportables()` · `findAll()` · `findOne()` · `documentoDe()` · `registrar()` · `anular()`

## Archivos

- `backend/src/modules/finanzas/movimientos-financieros.service.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--modulo-finanzas|finanzas (modulo NestJS)]]
- `uses` → [[entity--movimiento-financiero|MovimientoFinanciero]]
- `reads` → [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]]
- `uses` → [[entity--caja|Caja]]
- `reads` → [[table--finanzas-cajas|finanzas.cajas]]
- `uses` → [[entity--cuenta-bancaria|CuentaBancaria]]
- `reads` → [[table--finanzas-cuentas-bancarias|finanzas.cuentas_bancarias]]
- `uses` → [[entity--turno-caja|TurnoCaja]]
- `reads` → [[table--finanzas-turnos-caja|finanzas.turnos_caja]]
- `uses` → [[entity--documento-respaldo|DocumentoRespaldo]]
- `reads` → [[table--finanzas-documentos-respaldo|finanzas.documentos_respaldo]]
- `uses` → [[entity--parametro|Parametro]]
- `reads` → [[table--organizacion-parametros|organizacion.parametros]]
- `uses` → [[service--finanzas-ejercicios-fiscales|EjerciciosFiscalesService]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[service--finanzas-aportes|AportesService]] `uses` →
- [[service--finanzas-cuotas|CuotasService]] `uses` →
- [[service--finanzas-facturas|FacturasService]] `uses` →
- [[service--finanzas-integracion-finanzas|IntegracionFinanzasService]] `uses` →
- [[service--finanzas-ordenes-pago|OrdenesPagoService]] `uses` →
- [[api--finanzas-movimientos-financieros|MovimientosFinancierosController]] `exposes` →
- [[api--finanzas-reportes-finanzas|ReportesFinanzasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
