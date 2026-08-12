---
id: service--personal-especialidades-bombero
tipo: SERVICE
nombre: EspecialidadesBomberoService
nivel: L2
dominio: personal
resumen: Logica de negocio de especialidades bombero (modulo personal).
capa: backend
archivos:
  - backend/src/modules/personal/especialidades-bombero.service.ts
edges:
  - [belongs_to, domain--personal]
  - [uses, component--modulo-personal]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--bombero-especialidad]
  - [reads, table--personal-bombero-especialidades]
  - [uses, entity--especialidad]
  - [reads, table--organizacion-especialidades]
terminos: [especialidades, bombero, personal, especialidad]
---

# EspecialidadesBomberoService

Logica de negocio de especialidades bombero (modulo personal).


## Metodos

`listar()` · `reemplazar()`

## Archivos

- `backend/src/modules/personal/especialidades-bombero.service.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `uses` → [[component--modulo-personal|personal (modulo NestJS)]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--bombero-especialidad|BomberoEspecialidad]]
- `reads` → [[table--personal-bombero-especialidades|personal.bombero_especialidades]]
- `uses` → [[entity--especialidad|Especialidad]]
- `reads` → [[table--organizacion-especialidades|organizacion.especialidades]]

## Referenciado por

- [[api--personal-especialidades-bombero|EspecialidadesBomberoController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
