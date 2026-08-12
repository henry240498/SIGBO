---
id: service--operaciones-dashboard-asistencia
tipo: SERVICE
nombre: DashboardAsistenciaService
nivel: L2
dominio: asistencia
resumen: Logica de negocio de dashboard asistencia (modulo operaciones).
capa: backend
archivos:
  - backend/src/modules/operaciones/dashboard-asistencia.service.ts
edges:
  - [belongs_to, domain--asistencia]
  - [uses, component--modulo-operaciones]
  - [uses, entity--evento-asistencia]
  - [reads, table--operaciones-eventos-asistencia]
  - [uses, entity--participante-evento]
  - [reads, table--operaciones-participantes-evento]
  - [uses, entity--guardia]
  - [reads, table--operaciones-guardias]
  - [uses, entity--asignacion-guardia]
  - [reads, table--operaciones-asignacion-guardias]
  - [uses, entity--parametro]
  - [reads, table--organizacion-parametros]
  - [uses, service--operaciones-marcaciones]
terminos: [asistencia, operaciones, evento, participante, guardia, asignacion, parametro]
---

# DashboardAsistenciaService

Logica de negocio de dashboard asistencia (modulo operaciones).


## Metodos

`obtenerIndicadores()`

## Archivos

- `backend/src/modules/operaciones/dashboard-asistencia.service.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `uses` → [[component--modulo-operaciones|operaciones (modulo NestJS)]]
- `uses` → [[entity--evento-asistencia|EventoAsistencia]]
- `reads` → [[table--operaciones-eventos-asistencia|operaciones.eventos_asistencia]]
- `uses` → [[entity--participante-evento|ParticipanteEvento]]
- `reads` → [[table--operaciones-participantes-evento|operaciones.participantes_evento]]
- `uses` → [[entity--guardia|Guardia]]
- `reads` → [[table--operaciones-guardias|operaciones.guardias]]
- `uses` → [[entity--asignacion-guardia|AsignacionGuardia]]
- `reads` → [[table--operaciones-asignacion-guardias|operaciones.asignacion_guardias]]
- `uses` → [[entity--parametro|Parametro]]
- `reads` → [[table--organizacion-parametros|organizacion.parametros]]
- `uses` → [[service--operaciones-marcaciones|MarcacionesService]]

## Referenciado por

- [[api--operaciones-dashboard-asistencia|DashboardAsistenciaController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
