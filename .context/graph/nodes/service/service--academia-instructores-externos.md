---
id: service--academia-instructores-externos
tipo: SERVICE
nombre: InstructoresExternosService
nivel: L2
dominio: academia
resumen: Logica de negocio de instructores externos (modulo academia).
capa: backend
archivos:
  - backend/src/modules/academia/instructores-externos.service.ts
edges:
  - [belongs_to, domain--academia]
  - [uses, component--modulo-academia]
  - [uses, entity--instructor-externo]
  - [reads, table--academia-instructores-externos]
terminos: [instructores, externos, academia, instructor, externo]
---

# InstructoresExternosService

Logica de negocio de instructores externos (modulo academia).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()`

## Archivos

- `backend/src/modules/academia/instructores-externos.service.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `uses` → [[component--modulo-academia|academia (modulo NestJS)]]
- `uses` → [[entity--instructor-externo|InstructorExterno]]
- `reads` → [[table--academia-instructores-externos|academia.instructores_externos]]

## Referenciado por

- [[api--academia-instructores-externos|InstructoresExternosController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
