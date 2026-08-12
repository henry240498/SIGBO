---
id: entity--participante-externo
tipo: ENTITY
nombre: ParticipanteExterno
nivel: L1
dominio: asistencia
resumen: Persona que participa de un evento sin pertenecer al cuerpo de bomberos (civiles, estudiantes, invitados, personal de otras instituciones, etc.). Nunca genera automaticamente un registro en personal.bomberos.
tabla: operaciones.participantes_externos
archivos:
  - backend/src/shared/entities/participante-externo.entity.ts
edges:
  - [belongs_to, domain--asistencia]
  - [persisted_in, table--operaciones-participantes-externos]
terminos: [participante, externo, participantes, externos, operaciones]
---

# ParticipanteExterno

Persona que participa de un evento sin pertenecer al cuerpo de bomberos (civiles, estudiantes, invitados, personal de otras instituciones, etc.). Nunca genera automaticamente un registro en personal.bomberos.

- **Tabla:** [[table--operaciones-participantes-externos|operaciones.participantes_externos]]
- **Columnas mapeadas:** 8

## Archivos

- `backend/src/shared/entities/participante-externo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-participantes-externos|operaciones.participantes_externos]]

## Referenciado por

- [[service--operaciones-eventos-asistencia|EventosAsistenciaService]] `uses` →
- [[service--operaciones-participantes-externos|ParticipantesExternosService]] `uses` →
- [[workflow--asistencia-a-evento|Evento de asistencia, participantes y marcaciones]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
