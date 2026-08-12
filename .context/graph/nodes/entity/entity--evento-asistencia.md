---
id: entity--evento-asistencia
tipo: ENTITY
nombre: EventoAsistencia
nivel: L1
dominio: asistencia
resumen: Evento al que se puede asistir (guardia, reunion, capacitacion, academia, etc. - el tipo es parametrizable, ver organizacion.parametros tipo TIPO_EVENTO_ASISTENCIA). Distinto de la marcacion fisica de entrada/salida (ver MarcacionAsistencia) y de la participacion de una persona en el evento (ver ParticipanteEvento).
tabla: operaciones.eventos_asistencia
archivos:
  - backend/src/shared/entities/evento-asistencia.entity.ts
edges:
  - [belongs_to, domain--asistencia]
  - [persisted_in, table--operaciones-eventos-asistencia]
terminos: [evento, asistencia, eventos, operaciones, estado, programado, curso, finalizado, cancelado]
---

# EventoAsistencia

Evento al que se puede asistir (guardia, reunion, capacitacion, academia, etc. - el tipo es parametrizable, ver organizacion.parametros tipo TIPO_EVENTO_ASISTENCIA). Distinto de la marcacion fisica de entrada/salida (ver MarcacionAsistencia) y de la participacion de una persona en el evento (ver ParticipanteEvento).

- **Tabla:** [[table--operaciones-eventos-asistencia|operaciones.eventos_asistencia]]
- **Columnas mapeadas:** 10

## Estados y enumeraciones

- `EstadoEventoAsistencia`: `PROGRAMADO` · `EN_CURSO` · `FINALIZADO` · `CANCELADO`

## Archivos

- `backend/src/shared/entities/evento-asistencia.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-eventos-asistencia|operaciones.eventos_asistencia]]

## Referenciado por

- [[service--operaciones-dashboard-asistencia|DashboardAsistenciaService]] `uses` →
- [[service--operaciones-eventos-asistencia|EventosAsistenciaService]] `uses` →
- [[workflow--asistencia-a-evento|Evento de asistencia, participantes y marcaciones]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
