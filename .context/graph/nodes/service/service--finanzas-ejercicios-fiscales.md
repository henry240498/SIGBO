---
id: service--finanzas-ejercicios-fiscales
tipo: SERVICE
nombre: EjerciciosFiscalesService
nivel: L2
dominio: finanzas
resumen: "Periodos anuales de Finanzas (seccion 15 del pedido): todo movimiento pertenece a un ejercicio, nunca se mezclan entre anios."
capa: backend
archivos:
  - backend/src/modules/finanzas/ejercicios-fiscales.service.ts
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--modulo-finanzas]
  - [uses, entity--ejercicio-fiscal]
  - [reads, table--finanzas-ejercicios-fiscales]
  - [uses, service--seguridad-auditoria]
terminos: [ejercicios, fiscales, finanzas, ejercicio, fiscal]
---

# EjerciciosFiscalesService

Periodos anuales de Finanzas (seccion 15 del pedido): todo movimiento pertenece a un ejercicio, nunca se mezclan entre anios.


## Metodos

`findAll()` · `findOne()` · `resolverParaFecha()` · `create()` · `cerrar()` · `reabrir()`

## Archivos

- `backend/src/modules/finanzas/ejercicios-fiscales.service.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--modulo-finanzas|finanzas (modulo NestJS)]]
- `uses` → [[entity--ejercicio-fiscal|EjercicioFiscal]]
- `reads` → [[table--finanzas-ejercicios-fiscales|finanzas.ejercicios_fiscales]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[service--finanzas-movimientos-financieros|MovimientosFinancierosService]] `uses` →
- [[service--finanzas-ordenes-pago|OrdenesPagoService]] `uses` →
- [[api--finanzas-ejercicios-fiscales|EjerciciosFiscalesController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
