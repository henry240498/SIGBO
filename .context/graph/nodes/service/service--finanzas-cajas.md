---
id: service--finanzas-cajas
tipo: SERVICE
nombre: CajasService
nivel: L2
dominio: finanzas
resumen: "Cajas fisicas de efectivo (seccion 4) y sus turnos de apertura/cierre (seccion 5). `Caja.saldoActual` es mantenido exclusivamente por MovimientosFinancierosService; esta clase nunca lo edita directamente salvo al abrir un turno nuevo."
capa: backend
archivos:
  - backend/src/modules/finanzas/cajas.service.ts
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--modulo-finanzas]
  - [uses, entity--caja]
  - [reads, table--finanzas-cajas]
  - [uses, entity--turno-caja]
  - [reads, table--finanzas-turnos-caja]
  - [uses, service--seguridad-auditoria]
terminos: [cajas, finanzas, caja, turno]
---

# CajasService

Cajas fisicas de efectivo (seccion 4) y sus turnos de apertura/cierre (seccion 5). `Caja.saldoActual` es mantenido exclusivamente por MovimientosFinancierosService; esta clase nunca lo edita directamente salvo al abrir un turno nuevo.


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `turnos()` · `turnoAbierto()` · `abrir()` · `cerrar()`

## Archivos

- `backend/src/modules/finanzas/cajas.service.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--modulo-finanzas|finanzas (modulo NestJS)]]
- `uses` → [[entity--caja|Caja]]
- `reads` → [[table--finanzas-cajas|finanzas.cajas]]
- `uses` → [[entity--turno-caja|TurnoCaja]]
- `reads` → [[table--finanzas-turnos-caja|finanzas.turnos_caja]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--finanzas-cajas|CajasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
