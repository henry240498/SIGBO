---
id: service--equipos-categorias-equipo
tipo: SERVICE
nombre: CategoriasEquipoService
nivel: L2
dominio: equipos
resumen: Logica de negocio de categorias equipo (modulo equipos).
capa: backend
archivos:
  - backend/src/modules/equipos/categorias-equipo.service.ts
edges:
  - [belongs_to, domain--equipos]
  - [uses, component--modulo-equipos]
  - [uses, entity--categoria-equipo]
  - [reads, table--equipos-categorias-equipo]
terminos: [categorias, equipo, equipos, categoria]
---

# CategoriasEquipoService

Logica de negocio de categorias equipo (modulo equipos).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `remove()`

## Archivos

- `backend/src/modules/equipos/categorias-equipo.service.ts`

## Relaciones

- `belongs_to` → [[domain--equipos|Equipos]]
- `uses` → [[component--modulo-equipos|equipos (modulo NestJS)]]
- `uses` → [[entity--categoria-equipo|CategoriaEquipo]]
- `reads` → [[table--equipos-categorias-equipo|equipos.categorias_equipo]]

## Referenciado por

- [[api--equipos-categorias-equipo|CategoriasEquipoController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
