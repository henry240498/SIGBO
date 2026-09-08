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

## Donde se usa

- **Pantallas:** `/dashboard/deposito/bajas`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/equipos`, `/dashboard/equipos/[id]`, `/dashboard/equipos/categorias`
- **Endpoints:** CategoriasEquipoController, EquiposController
- **Servicios:** CategoriasEquipoService, EquiposService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

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
