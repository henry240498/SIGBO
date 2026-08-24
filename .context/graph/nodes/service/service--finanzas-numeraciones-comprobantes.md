---
id: service--finanzas-numeraciones-comprobantes
tipo: SERVICE
nombre: NumeracionesComprobantesService
nivel: L2
dominio: finanzas
resumen: "Configuracion de numeracion de comprobantes (seccion 18 del pedido): establecimiento/punto de expedicion/serie/timbrado/ vigencia. Solo se consume al emitir una Factura con origen=SIGBO (todavia no implementado -- queda preparado)."
capa: backend
archivos:
  - backend/src/modules/finanzas/numeraciones-comprobantes.service.ts
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--modulo-finanzas]
  - [uses, entity--numeracion-comprobante]
  - [reads, table--finanzas-numeraciones-comprobantes]
  - [uses, service--seguridad-auditoria]
terminos: [numeraciones, comprobantes, finanzas, numeracion, comprobante]
---

# NumeracionesComprobantesService

Configuracion de numeracion de comprobantes (seccion 18 del pedido): establecimiento/punto de expedicion/serie/timbrado/ vigencia. Solo se consume al emitir una Factura con origen=SIGBO (todavia no implementado -- queda preparado).


## Metodos

`findAll()` · `findOne()` · `create()`

## Archivos

- `backend/src/modules/finanzas/numeraciones-comprobantes.service.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--modulo-finanzas|finanzas (modulo NestJS)]]
- `uses` → [[entity--numeracion-comprobante|NumeracionComprobante]]
- `reads` → [[table--finanzas-numeraciones-comprobantes|finanzas.numeraciones_comprobantes]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--finanzas-numeraciones-comprobantes|NumeracionesComprobantesController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
