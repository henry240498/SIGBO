---
id: entity--bombero-especialidad
tipo: ENTITY
nombre: BomberoEspecialidad
nivel: L1
dominio: personal
resumen: Entidad BomberoEspecialidad, persistida en personal.bombero_especialidades.
tabla: personal.bombero_especialidades
archivos:
  - backend/src/shared/entities/bombero-especialidad.entity.ts
edges:
  - [belongs_to, domain--personal]
  - [persisted_in, table--personal-bombero-especialidades]
terminos: [bombero, especialidad, especialidades, personal]
---

# BomberoEspecialidad

Entidad BomberoEspecialidad, persistida en personal.bombero_especialidades.

- **Tabla:** [[table--personal-bombero-especialidades|personal.bombero_especialidades]]
- **Columnas mapeadas:** 7

## Archivos

- `backend/src/shared/entities/bombero-especialidad.entity.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `persisted_in` → [[table--personal-bombero-especialidades|personal.bombero_especialidades]]

## Referenciado por

- [[service--personal-especialidades-bombero|EspecialidadesBomberoService]] `uses` →
- [[service--personal-foja-servicio|FojaServicioService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
