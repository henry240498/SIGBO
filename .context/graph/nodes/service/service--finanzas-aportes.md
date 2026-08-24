---
id: service--finanzas-aportes
tipo: SERVICE
nombre: AportesService
nivel: L2
dominio: finanzas
resumen: "Lo que un Socio Protector EFECTIVAMENTE pago (seccion 5 del pedido: \"el monto acordado NO es el monto real\"). Cada aporte registra un ingreso real en finanzas.movimientos_financieros -- nunca se crea un ledger paralelo."
capa: backend
archivos:
  - backend/src/modules/finanzas/aportes.service.ts
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--modulo-finanzas]
  - [uses, entity--aporte]
  - [reads, table--finanzas-aportes]
  - [uses, entity--socio-protector]
  - [reads, table--finanzas-socios-protectores]
  - [uses, entity--acuerdo-aporte]
  - [reads, table--finanzas-acuerdos-aporte]
  - [uses, entity--parametro]
  - [reads, table--organizacion-parametros]
  - [uses, service--finanzas-movimientos-financieros]
  - [uses, service--seguridad-auditoria]
terminos: [aportes, finanzas, aporte, socio, protector, acuerdo, parametro]
---

# AportesService

Lo que un Socio Protector EFECTIVAMENTE pago (seccion 5 del pedido: "el monto acordado NO es el monto real"). Cada aporte registra un ingreso real en finanzas.movimientos_financieros -- nunca se crea un ledger paralelo.


## Metodos

`findAll()` · `findOne()` · `registrar()` · `anular()`

## Archivos

- `backend/src/modules/finanzas/aportes.service.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--modulo-finanzas|finanzas (modulo NestJS)]]
- `uses` → [[entity--aporte|Aporte]]
- `reads` → [[table--finanzas-aportes|finanzas.aportes]]
- `uses` → [[entity--socio-protector|SocioProtector]]
- `reads` → [[table--finanzas-socios-protectores|finanzas.socios_protectores]]
- `uses` → [[entity--acuerdo-aporte|AcuerdoAporte]]
- `reads` → [[table--finanzas-acuerdos-aporte|finanzas.acuerdos_aporte]]
- `uses` → [[entity--parametro|Parametro]]
- `reads` → [[table--organizacion-parametros|organizacion.parametros]]
- `uses` → [[service--finanzas-movimientos-financieros|MovimientosFinancierosService]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--finanzas-aportes|AportesController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
