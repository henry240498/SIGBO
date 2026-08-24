---
id: service--finanzas-socios-protectores
tipo: SERVICE
nombre: SociosProtectoresService
nivel: L2
dominio: finanzas
resumen: "Socios Protectores (personas fisicas, juridicas, o un bombero existente vinculado por bomberoId -- nunca se duplica el registro de Personal). El codigo visible (SC001) es independiente del PK y sus cambios se auditan en SocioHistorialCodigo (seccion 3 del pedido: SC001 -> SC125 debe dejar rastro)."
capa: backend
archivos:
  - backend/src/modules/finanzas/socios-protectores.service.ts
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--modulo-finanzas]
  - [uses, entity--socio-protector]
  - [reads, table--finanzas-socios-protectores]
  - [uses, entity--socio-historial-codigo]
  - [reads, table--finanzas-socios-historial-codigo]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--acuerdo-aporte]
  - [reads, table--finanzas-acuerdos-aporte]
  - [uses, entity--aporte]
  - [reads, table--finanzas-aportes]
  - [uses, entity--factura]
  - [reads, table--finanzas-facturas]
  - [uses, entity--movimiento-financiero]
  - [reads, table--finanzas-movimientos-financieros]
  - [uses, service--seguridad-auditoria]
terminos: [socios, protectores, finanzas, socio, protector, historial, codigo, bombero, acuerdo, aporte, factura, movimiento, financiero]
---

# SociosProtectoresService

Socios Protectores (personas fisicas, juridicas, o un bombero existente vinculado por bomberoId -- nunca se duplica el registro de Personal). El codigo visible (SC001) es independiente del PK y sus cambios se auditan en SocioHistorialCodigo (seccion 3 del pedido: SC001 -> SC125 debe dejar rastro).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `historialCodigo()` · `estadoDeCuenta()`

## Archivos

- `backend/src/modules/finanzas/socios-protectores.service.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--modulo-finanzas|finanzas (modulo NestJS)]]
- `uses` → [[entity--socio-protector|SocioProtector]]
- `reads` → [[table--finanzas-socios-protectores|finanzas.socios_protectores]]
- `uses` → [[entity--socio-historial-codigo|SocioHistorialCodigo]]
- `reads` → [[table--finanzas-socios-historial-codigo|finanzas.socios_historial_codigo]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--acuerdo-aporte|AcuerdoAporte]]
- `reads` → [[table--finanzas-acuerdos-aporte|finanzas.acuerdos_aporte]]
- `uses` → [[entity--aporte|Aporte]]
- `reads` → [[table--finanzas-aportes|finanzas.aportes]]
- `uses` → [[entity--factura|Factura]]
- `reads` → [[table--finanzas-facturas|finanzas.facturas]]
- `uses` → [[entity--movimiento-financiero|MovimientoFinanciero]]
- `reads` → [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--finanzas-socios-protectores|SociosProtectoresController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
