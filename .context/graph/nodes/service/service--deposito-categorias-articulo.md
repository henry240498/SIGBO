---
id: service--deposito-categorias-articulo
tipo: SERVICE
nombre: CategoriasArticuloService
nivel: L2
dominio: deposito
resumen: Logica de negocio de categorias articulo (modulo deposito).
capa: backend
archivos:
  - backend/src/modules/deposito/categorias-articulo.service.ts
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--modulo-deposito]
  - [uses, entity--categoria-articulo]
  - [reads, table--deposito-categorias-articulo]
  - [uses, service--seguridad-auditoria]
terminos: [categorias, articulo, deposito, categoria]
---

# CategoriasArticuloService

Logica de negocio de categorias articulo (modulo deposito).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `remove()`

## Archivos

- `backend/src/modules/deposito/categorias-articulo.service.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--modulo-deposito|deposito (modulo NestJS)]]
- `uses` → [[entity--categoria-articulo|CategoriaArticulo]]
- `reads` → [[table--deposito-categorias-articulo|deposito.categorias_articulo]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--deposito-categorias-articulo|CategoriasArticuloController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
