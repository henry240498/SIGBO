---
id: entity--designacion
tipo: ENTITY
nombre: Designacion
nivel: L1
dominio: organizacion
resumen: Entidad Designacion, persistida en organizacion.designaciones.
tabla: organizacion.designaciones
archivos:
  - backend/src/shared/entities/designacion.entity.ts
edges:
  - [belongs_to, domain--organizacion]
  - [persisted_in, table--organizacion-designaciones]
terminos: [designacion, designaciones, organizacion]
---

# Designacion

Entidad Designacion, persistida en organizacion.designaciones.

- **Tabla:** [[table--organizacion-designaciones|organizacion.designaciones]]
- **Columnas mapeadas:** 13

## Archivos

- `backend/src/shared/entities/designacion.entity.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `persisted_in` → [[table--organizacion-designaciones|organizacion.designaciones]]

## Referenciado por

- [[service--organizacion-dashboard|DashboardService]] `uses` →
- [[service--organizacion-designaciones|DesignacionesService]] `uses` →
- [[service--personal-foja-servicio|FojaServicioService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
