---
id: service--operaciones-participantes-externos
tipo: SERVICE
nombre: ParticipantesExternosService
nivel: L2
dominio: asistencia
resumen: Logica de negocio de participantes externos (modulo operaciones).
capa: backend
archivos:
  - backend/src/modules/operaciones/participantes-externos.service.ts
edges:
  - [belongs_to, domain--asistencia]
  - [uses, component--modulo-operaciones]
  - [uses, entity--participante-externo]
  - [reads, table--operaciones-participantes-externos]
terminos: [participantes, externos, operaciones, participante, externo]
---

# ParticipantesExternosService

Logica de negocio de participantes externos (modulo operaciones).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()`

## Archivos

- `backend/src/modules/operaciones/participantes-externos.service.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `uses` → [[component--modulo-operaciones|operaciones (modulo NestJS)]]
- `uses` → [[entity--participante-externo|ParticipanteExterno]]
- `reads` → [[table--operaciones-participantes-externos|operaciones.participantes_externos]]

## Referenciado por

- [[api--operaciones-participantes-externos|ParticipantesExternosController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
