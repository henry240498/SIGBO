---
id: service--operaciones-eventos-asistencia
tipo: SERVICE
nombre: EventosAsistenciaService
nivel: L2
dominio: asistencia
resumen: Logica de negocio de eventos asistencia (modulo operaciones).
capa: backend
archivos:
  - backend/src/modules/operaciones/eventos-asistencia.service.ts
edges:
  - [belongs_to, domain--asistencia]
  - [uses, component--modulo-operaciones]
  - [uses, entity--evento-asistencia]
  - [reads, table--operaciones-eventos-asistencia]
  - [uses, entity--participante-evento]
  - [reads, table--operaciones-participantes-evento]
  - [uses, entity--participante-externo]
  - [reads, table--operaciones-participantes-externos]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--marcacion-asistencia]
  - [reads, table--operaciones-marcaciones-asistencia]
  - [uses, service--seguridad-auditoria]
terminos: [eventos, asistencia, operaciones, evento, participante, externo, bombero, marcacion]
---

# EventosAsistenciaService

Logica de negocio de eventos asistencia (modulo operaciones).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `listarParticipantes()` · `agregarParticipante()` · `agregarParticipanteExistente()` · `actualizarParticipacion()` · `quitarParticipante()` · `calcularSolapamientoMarcaciones()` · `calcularYAplicarParticipacion()`

## Archivos

- `backend/src/modules/operaciones/eventos-asistencia.service.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `uses` → [[component--modulo-operaciones|operaciones (modulo NestJS)]]
- `uses` → [[entity--evento-asistencia|EventoAsistencia]]
- `reads` → [[table--operaciones-eventos-asistencia|operaciones.eventos_asistencia]]
- `uses` → [[entity--participante-evento|ParticipanteEvento]]
- `reads` → [[table--operaciones-participantes-evento|operaciones.participantes_evento]]
- `uses` → [[entity--participante-externo|ParticipanteExterno]]
- `reads` → [[table--operaciones-participantes-externos|operaciones.participantes_externos]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--marcacion-asistencia|MarcacionAsistencia]]
- `reads` → [[table--operaciones-marcaciones-asistencia|operaciones.marcaciones_asistencia]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[service--academia-sesiones-academia|SesionesAcademiaService]] `uses` →
- [[api--operaciones-eventos-asistencia|EventosAsistenciaController]] `exposes` →
- [[api--operaciones-marcaciones|MarcacionesController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
