---
id: entity--cuartel
tipo: ENTITY
nombre: Cuartel
nivel: L1
dominio: organizacion
resumen: Entidad Cuartel, persistida en organizacion.cuarteles.
tabla: organizacion.cuarteles
archivos:
  - backend/src/shared/entities/cuartel.entity.ts
edges:
  - [belongs_to, domain--organizacion]
  - [persisted_in, table--organizacion-cuarteles]
terminos: [cuartel, cuarteles, organizacion]
---

# Cuartel

Entidad Cuartel, persistida en organizacion.cuarteles.

- **Tabla:** [[table--organizacion-cuarteles|organizacion.cuarteles]]
- **Columnas mapeadas:** 10

## Archivos

- `backend/src/shared/entities/cuartel.entity.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `persisted_in` → [[table--organizacion-cuarteles|organizacion.cuarteles]]

## Referenciado por

- [[service--organizacion-cuarteles|CuartelsService]] `uses` →
- [[service--organizacion-dashboard|DashboardService]] `uses` →
- [[service--organizacion-designaciones|DesignacionesService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
