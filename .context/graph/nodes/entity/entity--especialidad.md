---
id: entity--especialidad
tipo: ENTITY
nombre: Especialidad
nivel: L1
dominio: organizacion
resumen: Entidad Especialidad, persistida en organizacion.especialidades.
tabla: organizacion.especialidades
archivos:
  - backend/src/shared/entities/especialidad.entity.ts
edges:
  - [belongs_to, domain--organizacion]
  - [persisted_in, table--organizacion-especialidades]
terminos: [especialidad, especialidades, organizacion]
---

# Especialidad

Entidad Especialidad, persistida en organizacion.especialidades.

- **Tabla:** [[table--organizacion-especialidades|organizacion.especialidades]]
- **Columnas mapeadas:** 8

## Archivos

- `backend/src/shared/entities/especialidad.entity.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `persisted_in` → [[table--organizacion-especialidades|organizacion.especialidades]]

## Referenciado por

- [[service--organizacion-dashboard|DashboardService]] `uses` →
- [[service--organizacion-especialidades|EspecialidadesService]] `uses` →
- [[service--personal-especialidades-bombero|EspecialidadesBomberoService]] `uses` →
- [[service--personal-foja-servicio|FojaServicioService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
