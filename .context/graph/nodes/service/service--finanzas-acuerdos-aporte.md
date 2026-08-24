---
id: service--finanzas-acuerdos-aporte
tipo: SERVICE
nombre: AcuerdosAporteService
nivel: L2
dominio: finanzas
resumen: "Lo que un Socio Protector SE COMPROMETIO a aportar (seccion 4 del pedido). Distinto y desacoplado de finanzas.Aporte: cambiar un acuerdo nunca reescribe los pagos ya registrados contra el."
capa: backend
archivos:
  - backend/src/modules/finanzas/acuerdos-aporte.service.ts
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--modulo-finanzas]
  - [uses, entity--acuerdo-aporte]
  - [reads, table--finanzas-acuerdos-aporte]
  - [uses, entity--socio-protector]
  - [reads, table--finanzas-socios-protectores]
  - [uses, service--seguridad-auditoria]
terminos: [acuerdos, aporte, finanzas, acuerdo, socio, protector]
---

# AcuerdosAporteService

Lo que un Socio Protector SE COMPROMETIO a aportar (seccion 4 del pedido). Distinto y desacoplado de finanzas.Aporte: cambiar un acuerdo nunca reescribe los pagos ya registrados contra el.


## Metodos

`findAll()` · `findOne()` · `create()` · `update()`

## Archivos

- `backend/src/modules/finanzas/acuerdos-aporte.service.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--modulo-finanzas|finanzas (modulo NestJS)]]
- `uses` → [[entity--acuerdo-aporte|AcuerdoAporte]]
- `reads` → [[table--finanzas-acuerdos-aporte|finanzas.acuerdos_aporte]]
- `uses` → [[entity--socio-protector|SocioProtector]]
- `reads` → [[table--finanzas-socios-protectores|finanzas.socios_protectores]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--finanzas-acuerdos-aporte|AcuerdosAporteController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
