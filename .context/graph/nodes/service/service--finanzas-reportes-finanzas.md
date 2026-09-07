---
id: service--finanzas-reportes-finanzas
tipo: SERVICE
nombre: ReportesFinanzasService
nivel: L2
dominio: finanzas
resumen: Genera el comprobante de un movimiento financiero (secciones 6, 8, 10, 24 del pedido), reutilizando el mismo motor documental (membrete institucional + firmante por cargo) que Academia y Ordenes de Guardia -- ver shared/utils/identidad-institucional.ts y firmantes-institucionales.ts. Las exportaciones tabulares (Excel/PDF de grillas) usan directamente el exportador generico del proyecto (shared/utils/excel.ts, pdf.ts) desde el controller, sin pasar por este service.
capa: backend
archivos:
  - backend/src/modules/finanzas/reportes-finanzas.service.ts
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--modulo-finanzas]
  - [uses, entity--movimiento-financiero]
  - [reads, table--finanzas-movimientos-financieros]
  - [uses, entity--documento-respaldo]
  - [reads, table--finanzas-documentos-respaldo]
  - [uses, entity--parametro]
  - [reads, table--organizacion-parametros]
  - [uses, entity--caja]
  - [reads, table--finanzas-cajas]
  - [uses, entity--cuenta-bancaria]
  - [reads, table--finanzas-cuentas-bancarias]
  - [uses, entity--proveedor-deposito]
  - [reads, table--deposito-proveedores]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--identidad-institucional]
  - [reads, table--organizacion-identidad-institucional]
  - [uses, entity--cargo]
  - [reads, table--organizacion-cargos]
  - [uses, entity--designacion]
  - [reads, table--organizacion-designaciones]
  - [uses, entity--rango]
  - [reads, table--organizacion-rangos]
terminos: [reportes, finanzas, movimiento, financiero, documento, respaldo, parametro, caja, cuenta, bancaria, proveedor, deposito, bombero, identidad, institucional, cargo, designacion, rango]
---

# ReportesFinanzasService

Genera el comprobante de un movimiento financiero (secciones 6, 8, 10, 24 del pedido), reutilizando el mismo motor documental (membrete institucional + firmante por cargo) que Academia y Ordenes de Guardia -- ver shared/utils/identidad-institucional.ts y firmantes-institucionales.ts. Las exportaciones tabulares (Excel/PDF de grillas) usan directamente el exportador generico del proyecto (shared/utils/excel.ts, pdf.ts) desde el controller, sin pasar por este service.


## Metodos

`generarComprobantePdf()`

## Archivos

- `backend/src/modules/finanzas/reportes-finanzas.service.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--modulo-finanzas|finanzas (modulo NestJS)]]
- `uses` → [[entity--movimiento-financiero|MovimientoFinanciero]]
- `reads` → [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]]
- `uses` → [[entity--documento-respaldo|DocumentoRespaldo]]
- `reads` → [[table--finanzas-documentos-respaldo|finanzas.documentos_respaldo]]
- `uses` → [[entity--parametro|Parametro]]
- `reads` → [[table--organizacion-parametros|organizacion.parametros]]
- `uses` → [[entity--caja|Caja]]
- `reads` → [[table--finanzas-cajas|finanzas.cajas]]
- `uses` → [[entity--cuenta-bancaria|CuentaBancaria]]
- `reads` → [[table--finanzas-cuentas-bancarias|finanzas.cuentas_bancarias]]
- `uses` → [[entity--proveedor-deposito|ProveedorDeposito]]
- `reads` → [[table--deposito-proveedores|deposito.proveedores]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--identidad-institucional|IdentidadInstitucional]]
- `reads` → [[table--organizacion-identidad-institucional|organizacion.identidad_institucional]]
- `uses` → [[entity--cargo|Cargo]]
- `reads` → [[table--organizacion-cargos|organizacion.cargos]]
- `uses` → [[entity--designacion|Designacion]]
- `reads` → [[table--organizacion-designaciones|organizacion.designaciones]]
- `uses` → [[entity--rango|Rango]]
- `reads` → [[table--organizacion-rangos|organizacion.rangos]]

## Referenciado por

- [[api--finanzas-reportes-finanzas|ReportesFinanzasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
