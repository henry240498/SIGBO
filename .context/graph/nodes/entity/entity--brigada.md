---
id: entity--brigada
tipo: ENTITY
nombre: Brigada
nivel: L1
dominio: organizacion
resumen: Entidad Brigada, persistida en organizacion.brigadas.
tabla: organizacion.brigadas
archivos:
  - backend/src/shared/entities/brigada.entity.ts
edges:
  - [belongs_to, domain--organizacion]
  - [persisted_in, table--organizacion-brigadas]
terminos: [brigada, brigadas, organizacion]
---

# Brigada

Entidad Brigada, persistida en organizacion.brigadas.

- **Tabla:** [[table--organizacion-brigadas|organizacion.brigadas]]
- **Columnas mapeadas:** 7

## Donde se usa

- **Pantallas:** `/dashboard/organizacion/brigadas`, `/dashboard/organizacion/unidades`
- **Endpoints:** BrigadasController
- **Servicios:** BrigadasService, DashboardService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/brigada.entity.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `persisted_in` → [[table--organizacion-brigadas|organizacion.brigadas]]

## Referenciado por

- [[service--organizacion-brigadas|BrigadasService]] `uses` →
- [[service--organizacion-dashboard|DashboardService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
