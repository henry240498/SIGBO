---
id: entity--categoria-equipo
tipo: ENTITY
nombre: CategoriaEquipo
nivel: L1
dominio: equipos
resumen: Entidad CategoriaEquipo, persistida en equipos.categorias_equipo.
tabla: equipos.categorias_equipo
archivos:
  - backend/src/shared/entities/categoria-equipo.entity.ts
edges:
  - [belongs_to, domain--equipos]
  - [persisted_in, table--equipos-categorias-equipo]
terminos: [categoria, equipo, categorias, equipos]
---

# CategoriaEquipo

Entidad CategoriaEquipo, persistida en equipos.categorias_equipo.

- **Tabla:** [[table--equipos-categorias-equipo|equipos.categorias_equipo]]
- **Columnas mapeadas:** 4

## Archivos

- `backend/src/shared/entities/categoria-equipo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--equipos|Equipos]]
- `persisted_in` → [[table--equipos-categorias-equipo|equipos.categorias_equipo]]

## Referenciado por

- [[service--equipos-categorias-equipo|CategoriasEquipoService]] `uses` →
- [[service--equipos-equipos|EquiposService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
