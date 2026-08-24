---
id: service--finanzas-notas-credito
tipo: SERVICE
nombre: NotasCreditoService
nivel: L2
dominio: finanzas
resumen: "Correccion NO destructiva de una Factura (seccion 17 del pedido): esta fila se AGREGA, la factura original nunca se edita ni se elimina -- la trazabilidad completa queda en ambas tablas."
capa: backend
archivos:
  - backend/src/modules/finanzas/notas-credito.service.ts
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--modulo-finanzas]
  - [uses, entity--nota-credito]
  - [reads, table--finanzas-notas-credito]
  - [uses, entity--factura]
  - [reads, table--finanzas-facturas]
  - [uses, service--seguridad-auditoria]
terminos: [notas, credito, finanzas, nota, factura]
---

# NotasCreditoService

Correccion NO destructiva de una Factura (seccion 17 del pedido): esta fila se AGREGA, la factura original nunca se edita ni se elimina -- la trazabilidad completa queda en ambas tablas.


## Metodos

`findAll()` · `findOne()` · `create()`

## Archivos

- `backend/src/modules/finanzas/notas-credito.service.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--modulo-finanzas|finanzas (modulo NestJS)]]
- `uses` → [[entity--nota-credito|NotaCredito]]
- `reads` → [[table--finanzas-notas-credito|finanzas.notas_credito]]
- `uses` → [[entity--factura|Factura]]
- `reads` → [[table--finanzas-facturas|finanzas.facturas]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--finanzas-notas-credito|NotasCreditoController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
