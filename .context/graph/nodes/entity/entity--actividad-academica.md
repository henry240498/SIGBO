---
id: entity--actividad-academica
tipo: ENTITY
nombre: ActividadAcademica
nivel: L1
dominio: academia
resumen: "La \"actividad academica\": curso/capacitacion/taller/etc. -- el tipo real (Curso, Capacitacion, Academia, Taller, ...) es parametrizable via organizacion.parametros (tipo TIPO_ACTIVIDAD_ACADEMICA), nunca fijo en codigo. Cada sesion/encuentro de la actividad se representa como una fila de operaciones.eventos_asistencia enlazada por actividadAcademicaId (ver migracion 037) -- esta tabla no duplica el registro de asistencia."
tabla: academia.actividades
archivos:
  - backend/src/shared/entities/actividad-academica.entity.ts
edges:
  - [belongs_to, domain--academia]
  - [persisted_in, table--academia-actividades]
terminos: [actividad, academica, actividades, academia, estado, planificada, abierta, curso, finalizada, cancelada]
---

# ActividadAcademica

La "actividad academica": curso/capacitacion/taller/etc. -- el tipo real (Curso, Capacitacion, Academia, Taller, ...) es parametrizable via organizacion.parametros (tipo TIPO_ACTIVIDAD_ACADEMICA), nunca fijo en codigo. Cada sesion/encuentro de la actividad se representa como una fila de operaciones.eventos_asistencia enlazada por actividadAcademicaId (ver migracion 037) -- esta tabla no duplica el registro de asistencia.

- **Tabla:** [[table--academia-actividades|academia.actividades]]
- **Columnas mapeadas:** 23

## Estados y enumeraciones

- `EstadoActividadAcademica`: `PLANIFICADA` · `ABIERTA` · `EN_CURSO` · `FINALIZADA` · `CANCELADA`

## Donde se usa

- **Pantallas:** `/dashboard/academia`, `/dashboard/academia/[id]`, `/dashboard/academia/cursos-externos`, `/dashboard/academia/instructores-externos`, `/dashboard/finanzas/beneficios`
- **Endpoints:** ActividadesAcademicasController, ConsultasAcademiaController, ConsultasCruzadasController, EvaluacionesAcademiaController, FojaServicioController, InscripcionesAcademiaController, ReportesAcademiaController, SesionesAcademiaController
- **Servicios:** ActividadesAcademicasService, ConsultasAcademiaService, ConsultasCruzadasService, EvaluacionesAcademiaService, FojaServicioService, IaToolsService, InscripcionesAcademiaService, ReportesAcademiaService, SesionesAcademiaService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/actividad-academica.entity.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `persisted_in` → [[table--academia-actividades|academia.actividades]]

## Referenciado por

- [[service--academia-actividades-academicas|ActividadesAcademicasService]] `uses` →
- [[service--academia-consultas-academia|ConsultasAcademiaService]] `uses` →
- [[service--academia-evaluaciones-academia|EvaluacionesAcademiaService]] `uses` →
- [[service--academia-inscripciones-academia|InscripcionesAcademiaService]] `uses` →
- [[service--academia-reportes-academia|ReportesAcademiaService]] `uses` →
- [[service--academia-sesiones-academia|SesionesAcademiaService]] `uses` →
- [[service--ia-ia-tools|IaToolsService]] `uses` →
- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `uses` →
- [[service--personal-foja-servicio|FojaServicioService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
