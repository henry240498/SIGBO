---
id: service--guardias-esquemas-horario
tipo: SERVICE
nombre: EsquemasHorarioService
nivel: L2
dominio: guardias
resumen: Logica de negocio de esquemas horario (modulo guardias).
capa: backend
archivos:
  - backend/src/modules/guardias/esquemas-horario.service.ts
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--modulo-guardias]
  - [uses, entity--esquema-horario-guardia]
  - [reads, table--operaciones-esquemas-horario-guardia]
terminos: [esquemas, horario, guardias, esquema, guardia]
---

# EsquemasHorarioService

Logica de negocio de esquemas horario (modulo guardias).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `remove()`

## Archivos

- `backend/src/modules/guardias/esquemas-horario.service.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--modulo-guardias|guardias (modulo NestJS)]]
- `uses` → [[entity--esquema-horario-guardia|EsquemaHorarioGuardia]]
- `reads` → [[table--operaciones-esquemas-horario-guardia|operaciones.esquemas_horario_guardia]]

## Referenciado por

- [[api--guardias-esquemas-horario|EsquemasHorarioController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
