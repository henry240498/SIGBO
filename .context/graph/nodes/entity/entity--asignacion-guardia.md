---
id: entity--asignacion-guardia
tipo: ENTITY
nombre: AsignacionGuardia
nivel: L1
dominio: asistencia
resumen: Bomberos asignados a cada guardia programada (schema operaciones).
tabla: operaciones.asignacion_guardias
archivos:
  - backend/src/shared/entities/asignacion-guardia.entity.ts
edges:
  - [belongs_to, domain--asistencia]
  - [persisted_in, table--operaciones-asignacion-guardias]
terminos: [asignacion, guardia, guardias, operaciones, estado, asignado, confirmado, reemplazado, ausente, tipo, participacion, titular, refuerzo, reemplazo]
---

# AsignacionGuardia

Bomberos asignados a cada guardia programada (schema operaciones).

- **Tabla:** [[table--operaciones-asignacion-guardias|operaciones.asignacion_guardias]]
- **Columnas mapeadas:** 13

## Estados y enumeraciones

- `EstadoAsignacionGuardia`: `ASIGNADO` · `CONFIRMADO` · `REEMPLAZADO` · `AUSENTE`
- `TipoParticipacionGuardia`: `TITULAR` · `REFUERZO` · `REEMPLAZO`

## Donde se usa

- **Pantallas:** `/dashboard/academia/[id]`, `/dashboard/asistencia`, `/dashboard/asistencia/eventos`, `/dashboard/asistencia/eventos/[id]`, `/dashboard/asistencia/externos`, `/dashboard/asistencia/registro`, `/dashboard/asistencia/tolerancias`, `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/feriados`, `/dashboard/organizacion/guardias/planificacion`, `/dashboard/personal/[id]`
- **Endpoints:** ConsultasCruzadasController, DashboardAsistenciaController, GuardiasController, OrdenesGuardiaController, PerfilController
- **Servicios:** ConsultasCruzadasService, DashboardAsistenciaService, GeneracionService, GuardiasService, IaToolsService, OrdenesGuardiaService, PerfilService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/asignacion-guardia.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-asignacion-guardias|operaciones.asignacion_guardias]]

## Referenciado por

- [[service--guardias-generacion|GeneracionService]] `uses` →
- [[service--guardias-guardias|GuardiasService]] `uses` →
- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `uses` →
- [[service--ia-ia-tools|IaToolsService]] `uses` →
- [[service--operaciones-dashboard-asistencia|DashboardAsistenciaService]] `uses` →
- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `uses` →
- [[service--seguridad-perfil|PerfilService]] `uses` →
- [[workflow--guardia-y-pernocte|Operacion de una guardia: grupos, asignaciones, presencia, novedades y pernoctes]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
