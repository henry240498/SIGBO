---
id: service--deposito-articulos
tipo: SERVICE
nombre: ArticulosService
nivel: L2
dominio: deposito
resumen: Logica de negocio de articulos (modulo deposito).
capa: backend
archivos:
  - backend/src/modules/deposito/articulos.service.ts
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--modulo-deposito]
  - [uses, entity--articulo]
  - [reads, table--deposito-articulos]
  - [uses, entity--tenencia-deposito]
  - [reads, table--deposito-tenencias]
  - [uses, service--deposito-movimientos-deposito]
  - [uses, service--seguridad-auditoria]
terminos: [articulos, deposito, articulo, tenencia]
---

# ArticulosService

Logica de negocio de articulos (modulo deposito).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `tenencias()`

## Archivos

- `backend/src/modules/deposito/articulos.service.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--modulo-deposito|deposito (modulo NestJS)]]
- `uses` → [[entity--articulo|Articulo]]
- `reads` → [[table--deposito-articulos|deposito.articulos]]
- `uses` → [[entity--tenencia-deposito|TenenciaDeposito]]
- `reads` → [[table--deposito-tenencias|deposito.tenencias]]
- `uses` → [[service--deposito-movimientos-deposito|MovimientosDepositoService]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[service--deposito-alertas-deposito|AlertasDepositoService]] `uses` →
- [[api--deposito-articulos|ArticulosController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
