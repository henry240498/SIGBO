---
id: service--finanzas-cuotas
tipo: SERVICE
nombre: CuotasService
nivel: L2
dominio: finanzas
resumen: Cuotas institucionales (seccion 7 del pedido). No todos los bomberos necesariamente pagan cuota -- esta tabla solo tiene filas para quien realmente tenga una cuota asignada, nunca se infiere.
capa: backend
archivos:
  - backend/src/modules/finanzas/cuotas.service.ts
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--modulo-finanzas]
  - [uses, entity--cuota]
  - [reads, table--finanzas-cuotas]
  - [uses, entity--parametro]
  - [reads, table--organizacion-parametros]
  - [uses, service--finanzas-movimientos-financieros]
  - [uses, service--seguridad-auditoria]
terminos: [cuotas, finanzas, cuota, parametro]
---

# CuotasService

Cuotas institucionales (seccion 7 del pedido). No todos los bomberos necesariamente pagan cuota -- esta tabla solo tiene filas para quien realmente tenga una cuota asignada, nunca se infiere.


## Metodos

`findAll()` · `findOne()` · `create()` · `pagar()` · `anular()` · `exonerar()`

## Archivos

- `backend/src/modules/finanzas/cuotas.service.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--modulo-finanzas|finanzas (modulo NestJS)]]
- `uses` → [[entity--cuota|Cuota]]
- `reads` → [[table--finanzas-cuotas|finanzas.cuotas]]
- `uses` → [[entity--parametro|Parametro]]
- `reads` → [[table--organizacion-parametros|organizacion.parametros]]
- `uses` → [[service--finanzas-movimientos-financieros|MovimientosFinancierosService]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--finanzas-cuotas|CuotasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
