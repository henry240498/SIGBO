---
id: entity--ascenso
tipo: ENTITY
nombre: Ascenso
nivel: L1
dominio: organizacion
resumen: Entidad Ascenso, persistida en organizacion.ascensos.
tabla: organizacion.ascensos
archivos:
  - backend/src/shared/entities/ascenso.entity.ts
edges:
  - [belongs_to, domain--organizacion]
  - [persisted_in, table--organizacion-ascensos]
terminos: [ascenso, ascensos, organizacion]
---

# Ascenso

Entidad Ascenso, persistida en organizacion.ascensos.

- **Tabla:** [[table--organizacion-ascensos|organizacion.ascensos]]
- **Columnas mapeadas:** 12

## Donde se usa

- **Pantallas:** `/dashboard/organizacion/ascensos`
- **Endpoints:** AscensosController
- **Servicios:** AscensosService, DashboardService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/ascenso.entity.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `persisted_in` → [[table--organizacion-ascensos|organizacion.ascensos]]

## Referenciado por

- [[service--organizacion-ascensos|AscensosService]] `uses` →
- [[service--organizacion-dashboard|DashboardService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
