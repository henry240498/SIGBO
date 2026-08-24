---
id: entity--guardia
tipo: ENTITY
nombre: Guardia
nivel: L1
dominio: asistencia
resumen: Guardias programadas reales (schema operaciones). No confundir con organizacion.tipos_guardia, que es el catalogo de tipos.
tabla: operaciones.guardias
archivos:
  - backend/src/shared/entities/guardia.entity.ts
edges:
  - [belongs_to, domain--asistencia]
  - [persisted_in, table--operaciones-guardias]
terminos: [guardia, guardias, operaciones, turno, diurno, nocturno, completo, tipo, registro, ordinaria, especial, extraordinaria, estado, planificada, confirmada, curso, finalizada, cancelada, anulada]
---

# Guardia

Guardias programadas reales (schema operaciones). No confundir con organizacion.tipos_guardia, que es el catalogo de tipos.

- **Tabla:** [[table--operaciones-guardias|operaciones.guardias]]
- **Columnas mapeadas:** 16

## Estados y enumeraciones

- `TurnoGuardia`: `DIURNO` · `NOCTURNO` · `COMPLETO`
- `TipoGuardiaRegistro`: `ORDINARIA` · `ESPECIAL` · `EXTRAORDINARIA`
- `EstadoGuardia`: `PLANIFICADA` · `CONFIRMADA` · `EN_CURSO` · `FINALIZADA` · `CANCELADA` · `ANULADA`

## Donde se usa

- **Pantallas:** `/dashboard/academia/[id]`, `/dashboard/asistencia`, `/dashboard/asistencia/eventos`, `/dashboard/asistencia/eventos/[id]`, `/dashboard/asistencia/externos`, `/dashboard/asistencia/registro`, `/dashboard/asistencia/tolerancias`, `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/feriados`, `/dashboard/personal/[id]`
- **Endpoints:** BitacoraController, ConsultasCruzadasController, DashboardAsistenciaController, FeriadosController, GruposGuardiaController, GuardiasController, InspeccionesEstacionController, InspeccionesMovilController, NovedadesController, OrdenesGuardiaController
- **Servicios:** BitacoraService, ConsultasCruzadasService, DashboardAsistenciaService, FeriadosService, GeneracionService, GruposGuardiaService, GuardiasService, IaToolsService, InspeccionesEstacionService, InspeccionesMovilService, NovedadesService, OrdenesGuardiaService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/guardia.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-guardias|operaciones.guardias]]

## Referenciado por

- [[service--guardias-bitacora|BitacoraService]] `uses` →
- [[service--guardias-generacion|GeneracionService]] `uses` →
- [[service--guardias-grupos-guardia|GruposGuardiaService]] `uses` →
- [[service--guardias-guardias|GuardiasService]] `uses` →
- [[service--guardias-inspecciones-estacion|InspeccionesEstacionService]] `uses` →
- [[service--guardias-inspecciones-movil|InspeccionesMovilService]] `uses` →
- [[service--guardias-novedades|NovedadesService]] `uses` →
- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `uses` →
- [[service--ia-ia-tools|IaToolsService]] `uses` →
- [[service--operaciones-dashboard-asistencia|DashboardAsistenciaService]] `uses` →
- [[service--organizacion-feriados|FeriadosService]] `uses` →
- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `uses` →
- [[workflow--guardia-y-pernocte|Operacion de una guardia: grupos, asignaciones, presencia, novedades y pernoctes]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
