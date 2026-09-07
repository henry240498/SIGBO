---
id: service--finanzas-facturas
tipo: SERVICE
nombre: FacturasService
nivel: L2
dominio: finanzas
resumen: "Registro de facturacion (seccion 15-16 del pedido). Una factura con `aporteId` es documental sobre un ingreso YA registrado por el Aporte -- no genera un segundo movimiento (evita duplicar el ingreso). Una factura sin aporteId puede, si se pide explicitamente (`generarIngreso`), registrar su propio ingreso -- nunca de forma implicita."
capa: backend
archivos:
  - backend/src/modules/finanzas/facturas.service.ts
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--modulo-finanzas]
  - [uses, entity--factura]
  - [reads, table--finanzas-facturas]
  - [uses, entity--aporte]
  - [reads, table--finanzas-aportes]
  - [uses, service--finanzas-movimientos-financieros]
  - [uses, service--seguridad-auditoria]
terminos: [facturas, finanzas, factura, aporte]
---

# FacturasService

Registro de facturacion (seccion 15-16 del pedido). Una factura con `aporteId` es documental sobre un ingreso YA registrado por el Aporte -- no genera un segundo movimiento (evita duplicar el ingreso). Una factura sin aporteId puede, si se pide explicitamente (`generarIngreso`), registrar su propio ingreso -- nunca de forma implicita.


## Metodos

`findAll()` · `findOne()` · `create()` · `anular()`

## Archivos

- `backend/src/modules/finanzas/facturas.service.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--modulo-finanzas|finanzas (modulo NestJS)]]
- `uses` → [[entity--factura|Factura]]
- `reads` → [[table--finanzas-facturas|finanzas.facturas]]
- `uses` → [[entity--aporte|Aporte]]
- `reads` → [[table--finanzas-aportes|finanzas.aportes]]
- `uses` → [[service--finanzas-movimientos-financieros|MovimientosFinancierosService]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--finanzas-facturas|FacturasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
