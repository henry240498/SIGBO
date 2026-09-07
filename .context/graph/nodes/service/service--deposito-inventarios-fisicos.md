---
id: service--deposito-inventarios-fisicos
tipo: SERVICE
nombre: InventariosFisicosService
nivel: L2
dominio: deposito
resumen: Logica de negocio de inventarios fisicos (modulo deposito).
capa: backend
archivos:
  - backend/src/modules/deposito/inventarios-fisicos.service.ts
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--modulo-deposito]
  - [uses, entity--inventario-fisico-deposito]
  - [reads, table--deposito-inventarios-fisicos]
  - [uses, entity--inventario-fisico-item-deposito]
  - [reads, table--deposito-inventario-fisico-items]
  - [uses, entity--tenencia-deposito]
  - [reads, table--deposito-tenencias]
  - [uses, entity--incidencia-deposito]
  - [reads, table--deposito-incidencias]
  - [uses, service--seguridad-auditoria]
terminos: [inventarios, fisicos, deposito, inventario, fisico, item, tenencia, incidencia]
---

# InventariosFisicosService

Logica de negocio de inventarios fisicos (modulo deposito).


## Metodos

`findAll()` · `findOne()` · `items()` · `create()` · `agregarItem()` · `finalizar()`

## Archivos

- `backend/src/modules/deposito/inventarios-fisicos.service.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--modulo-deposito|deposito (modulo NestJS)]]
- `uses` → [[entity--inventario-fisico-deposito|InventarioFisicoDeposito]]
- `reads` → [[table--deposito-inventarios-fisicos|deposito.inventarios_fisicos]]
- `uses` → [[entity--inventario-fisico-item-deposito|InventarioFisicoItemDeposito]]
- `reads` → [[table--deposito-inventario-fisico-items|deposito.inventario_fisico_items]]
- `uses` → [[entity--tenencia-deposito|TenenciaDeposito]]
- `reads` → [[table--deposito-tenencias|deposito.tenencias]]
- `uses` → [[entity--incidencia-deposito|IncidenciaDeposito]]
- `reads` → [[table--deposito-incidencias|deposito.incidencias]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--deposito-inventarios-fisicos|InventariosFisicosController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
