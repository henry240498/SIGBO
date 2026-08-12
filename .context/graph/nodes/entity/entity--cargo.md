---
id: entity--cargo
tipo: ENTITY
nombre: Cargo
nivel: L1
dominio: organizacion
resumen: Entidad Cargo, persistida en organizacion.cargos.
tabla: organizacion.cargos
archivos:
  - backend/src/shared/entities/cargo.entity.ts
edges:
  - [belongs_to, domain--organizacion]
  - [persisted_in, table--organizacion-cargos]
terminos: [cargo, cargos, organizacion]
---

# Cargo

Entidad Cargo, persistida en organizacion.cargos.

- **Tabla:** [[table--organizacion-cargos|organizacion.cargos]]
- **Columnas mapeadas:** 10

## Archivos

- `backend/src/shared/entities/cargo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `persisted_in` → [[table--organizacion-cargos|organizacion.cargos]]

## Referenciado por

- [[service--organizacion-cargos|CargosService]] `uses` →
- [[service--organizacion-dashboard|DashboardService]] `uses` →
- [[service--organizacion-designaciones|DesignacionesService]] `uses` →
- [[service--personal-foja-servicio|FojaServicioService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
