---
id: service--finanzas-presupuestos
tipo: SERVICE
nombre: PresupuestosService
nivel: L2
dominio: finanzas
resumen: "Presupuesto por categoria de egreso y ejercicio (seccion 14). El \"ejecutado\" NUNCA se guarda como columna -- se calcula en tiempo real sumando finanzas.movimientos_financieros para que nunca quede desincronizado del historial real."
capa: backend
archivos:
  - backend/src/modules/finanzas/presupuestos.service.ts
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--modulo-finanzas]
  - [uses, entity--presupuesto]
  - [reads, table--finanzas-presupuestos]
  - [uses, entity--movimiento-financiero]
  - [reads, table--finanzas-movimientos-financieros]
  - [uses, service--seguridad-auditoria]
terminos: [presupuestos, finanzas, presupuesto, movimiento, financiero]
---

# PresupuestosService

Presupuesto por categoria de egreso y ejercicio (seccion 14). El "ejecutado" NUNCA se guarda como columna -- se calcula en tiempo real sumando finanzas.movimientos_financieros para que nunca quede desincronizado del historial real.


## Metodos

`findAll()` · `findOne()` · `create()` · `update()`

## Archivos

- `backend/src/modules/finanzas/presupuestos.service.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--modulo-finanzas|finanzas (modulo NestJS)]]
- `uses` → [[entity--presupuesto|Presupuesto]]
- `reads` → [[table--finanzas-presupuestos|finanzas.presupuestos]]
- `uses` → [[entity--movimiento-financiero|MovimientoFinanciero]]
- `reads` → [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--finanzas-presupuestos|PresupuestosController]] `exposes` →
- [[api--finanzas-reportes-finanzas|ReportesFinanzasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
