---
id: service--deposito-dashboard-deposito
tipo: SERVICE
nombre: DashboardDepositoService
nivel: L2
dominio: deposito
resumen: Indicadores de la pantalla principal de Deposito (seccion 18 del pedido). Los numeros son siempre calculados en el momento, nunca cacheados/desincronizables.
capa: backend
archivos:
  - backend/src/modules/deposito/dashboard-deposito.service.ts
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--modulo-deposito]
  - [uses, entity--tenencia-deposito]
  - [reads, table--deposito-tenencias]
  - [uses, entity--articulo]
  - [reads, table--deposito-articulos]
  - [uses, entity--lote-articulo]
  - [reads, table--deposito-lotes-articulo]
  - [uses, entity--incidencia-deposito]
  - [reads, table--deposito-incidencias]
  - [uses, service--deposito-alertas-deposito]
terminos: [deposito, tenencia, articulo, lote, incidencia]
---

# DashboardDepositoService

Indicadores de la pantalla principal de Deposito (seccion 18 del pedido). Los numeros son siempre calculados en el momento, nunca cacheados/desincronizables.


## Metodos

`indicadores()`

## Archivos

- `backend/src/modules/deposito/dashboard-deposito.service.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--modulo-deposito|deposito (modulo NestJS)]]
- `uses` → [[entity--tenencia-deposito|TenenciaDeposito]]
- `reads` → [[table--deposito-tenencias|deposito.tenencias]]
- `uses` → [[entity--articulo|Articulo]]
- `reads` → [[table--deposito-articulos|deposito.articulos]]
- `uses` → [[entity--lote-articulo|LoteArticulo]]
- `reads` → [[table--deposito-lotes-articulo|deposito.lotes_articulo]]
- `uses` → [[entity--incidencia-deposito|IncidenciaDeposito]]
- `reads` → [[table--deposito-incidencias|deposito.incidencias]]
- `uses` → [[service--deposito-alertas-deposito|AlertasDepositoService]]

## Referenciado por

- [[api--deposito-dashboard-deposito|DashboardDepositoController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
