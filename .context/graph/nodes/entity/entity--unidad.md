---
id: entity--unidad
tipo: ENTITY
nombre: Unidad
nivel: L1
dominio: organizacion
resumen: Entidad Unidad, persistida en organizacion.unidades.
tabla: organizacion.unidades
archivos:
  - backend/src/shared/entities/unidad.entity.ts
edges:
  - [belongs_to, domain--organizacion]
  - [persisted_in, table--organizacion-unidades]
terminos: [unidad, unidades, organizacion]
---

# Unidad

Entidad Unidad, persistida en organizacion.unidades.

- **Tabla:** [[table--organizacion-unidades|organizacion.unidades]]
- **Columnas mapeadas:** 8

## Donde se usa

- **Pantallas:** `/dashboard/organizacion/unidades`
- **Endpoints:** UnidadesController
- **Servicios:** DashboardService, UnidadesService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/unidad.entity.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `persisted_in` → [[table--organizacion-unidades|organizacion.unidades]]

## Referenciado por

- [[service--organizacion-dashboard|DashboardService]] `uses` →
- [[service--organizacion-unidades|UnidadesService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
