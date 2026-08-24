---
id: service--finanzas-ordenes-pago
tipo: SERVICE
nombre: OrdenesPagoService
nivel: L2
dominio: finanzas
resumen: Logica de negocio de ordenes pago (modulo finanzas).
capa: backend
archivos:
  - backend/src/modules/finanzas/ordenes-pago.service.ts
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--modulo-finanzas]
  - [uses, entity--orden-pago]
  - [reads, table--finanzas-ordenes-pago]
  - [uses, service--finanzas-ejercicios-fiscales]
  - [uses, service--finanzas-movimientos-financieros]
  - [uses, service--seguridad-auditoria]
terminos: [ordenes, pago, finanzas, orden]
---

# OrdenesPagoService

Logica de negocio de ordenes pago (modulo finanzas).


## Metodos

`findAll()` · `findOne()` · `create()` · `solicitar()` · `enviarAutorizacion()` · `autorizar()` · `rechazar()` · `reabrir()` · `anular()` · `pagar()`

## Archivos

- `backend/src/modules/finanzas/ordenes-pago.service.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--modulo-finanzas|finanzas (modulo NestJS)]]
- `uses` → [[entity--orden-pago|OrdenPago]]
- `reads` → [[table--finanzas-ordenes-pago|finanzas.ordenes_pago]]
- `uses` → [[service--finanzas-ejercicios-fiscales|EjerciciosFiscalesService]]
- `uses` → [[service--finanzas-movimientos-financieros|MovimientosFinancierosService]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--finanzas-ordenes-pago|OrdenesPagoController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
