---
id: entity--inscripcion-actividad-academica
tipo: ENTITY
nombre: InscripcionActividadAcademica
nivel: L1
dominio: academia
resumen: Inscripcion de un participante (bombero O participante externo, nunca ambos) a una actividad academica. Reemplaza a la vieja academia.inscripciones_cursos (schema legado, migracion 004). Distinto de la asistencia por sesion, que vive en operaciones.participantes_evento.
tabla: academia.inscripciones
archivos:
  - backend/src/shared/entities/inscripcion-actividad-academica.entity.ts
edges:
  - [belongs_to, domain--academia]
  - [persisted_in, table--academia-inscripciones]
terminos: [inscripcion, actividad, academica, inscripciones, academia, estado, inscrito, activo, retirado, finalizado]
---

# InscripcionActividadAcademica

Inscripcion de un participante (bombero O participante externo, nunca ambos) a una actividad academica. Reemplaza a la vieja academia.inscripciones_cursos (schema legado, migracion 004). Distinto de la asistencia por sesion, que vive en operaciones.participantes_evento.

- **Tabla:** [[table--academia-inscripciones|academia.inscripciones]]
- **Columnas mapeadas:** 14

## Estados y enumeraciones

- `EstadoInscripcionActividad`: `INSCRITO` · `ACTIVO` · `RETIRADO` · `FINALIZADO`

## Donde se usa

- **Pantallas:** `/dashboard/academia`, `/dashboard/academia/[id]`, `/dashboard/academia/cursos-externos`, `/dashboard/academia/instructores-externos`, `/dashboard/finanzas/beneficios`
- **Endpoints:** ConsultasAcademiaController, ConsultasCruzadasController, EvaluacionesAcademiaController, FojaServicioController, InscripcionesAcademiaController, SesionesAcademiaController
- **Servicios:** ConsultasAcademiaService, ConsultasCruzadasService, EvaluacionesAcademiaService, FojaServicioService, IaToolsService, InscripcionesAcademiaService, SesionesAcademiaService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/inscripcion-actividad-academica.entity.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `persisted_in` → [[table--academia-inscripciones|academia.inscripciones]]

## Referenciado por

- [[service--academia-consultas-academia|ConsultasAcademiaService]] `uses` →
- [[service--academia-evaluaciones-academia|EvaluacionesAcademiaService]] `uses` →
- [[service--academia-inscripciones-academia|InscripcionesAcademiaService]] `uses` →
- [[service--academia-sesiones-academia|SesionesAcademiaService]] `uses` →
- [[service--ia-ia-tools|IaToolsService]] `uses` →
- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `uses` →
- [[service--personal-foja-servicio|FojaServicioService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
