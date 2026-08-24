---
id: service--deposito-lotes-articulo
tipo: SERVICE
nombre: LotesArticuloService
nivel: L2
dominio: deposito
resumen: "CRUD de lotes/vencimientos (seccion 17 del pedido) -- metadata de trazabilidad por lote (insumos medicos, medicamentos, quimicos), en paralelo al stock agregado que ya administra deposito.articulos. `cantidad` de un lote es informativa sobre ese lote especifico; el total disponible del articulo sigue siendo `Articulo.stockActual`."
capa: backend
archivos:
  - backend/src/modules/deposito/lotes-articulo.service.ts
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--modulo-deposito]
  - [uses, entity--lote-articulo]
  - [reads, table--deposito-lotes-articulo]
  - [uses, entity--articulo]
  - [reads, table--deposito-articulos]
  - [uses, service--seguridad-auditoria]
terminos: [lotes, articulo, deposito, lote]
---

# LotesArticuloService

CRUD de lotes/vencimientos (seccion 17 del pedido) -- metadata de trazabilidad por lote (insumos medicos, medicamentos, quimicos), en paralelo al stock agregado que ya administra deposito.articulos. `cantidad` de un lote es informativa sobre ese lote especifico; el total disponible del articulo sigue siendo `Articulo.stockActual`.


## Metodos

`findAll()` · `findOne()` · `proximosAVencer()` · `create()` · `actualizarVencidos()`

## Archivos

- `backend/src/modules/deposito/lotes-articulo.service.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--modulo-deposito|deposito (modulo NestJS)]]
- `uses` → [[entity--lote-articulo|LoteArticulo]]
- `reads` → [[table--deposito-lotes-articulo|deposito.lotes_articulo]]
- `uses` → [[entity--articulo|Articulo]]
- `reads` → [[table--deposito-articulos|deposito.articulos]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[service--deposito-alertas-deposito|AlertasDepositoService]] `uses` →
- [[api--deposito-lotes-articulo|LotesArticuloController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
