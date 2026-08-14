---
id: entity--bombero
tipo: ENTITY
nombre: Bombero
nivel: L1
dominio: personal
resumen: Entidad Bombero, persistida en personal.bomberos.
tabla: personal.bomberos
archivos:
  - backend/src/shared/entities/bombero.entity.ts
edges:
  - [belongs_to, domain--personal]
  - [persisted_in, table--personal-bomberos]
terminos: [bombero, bomberos, personal, estado, aspirante, activo, suspendido, licencia, retirado, fallecido, honorario, condicion, institucional, incorporado, combatiente, apoyo, economico]
---

# Bombero

Entidad Bombero, persistida en personal.bomberos.

- **Tabla:** [[table--personal-bomberos|personal.bomberos]]
- **Columnas mapeadas:** 59

## Estados y enumeraciones

- `EstadoBombero`: `ASPIRANTE` · `ACTIVO` · `SUSPENDIDO` · `LICENCIA` · `RETIRADO` · `FALLECIDO` · `HONORARIO`
- `CondicionInstitucional`: `INCORPORADO` · `COMBATIENTE` · `APOYO_ECONOMICO` · `HONORARIO`

## Donde se usa

- **Pantallas:** `/`, `/dashboard/asistencia`, `/dashboard/asistencia/eventos`, `/dashboard/asistencia/eventos/[id]`, `/dashboard/asistencia/externos`, `/dashboard/asistencia/registro`, `/dashboard/asistencia/tolerancias`, `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/ascensos`, `/dashboard/organizacion/designaciones`, `/dashboard/organizacion/feriados`, `/dashboard/personal/[id]`, `/dashboard/publicaciones`, `/dashboard/servicios`, `/dashboard/servicios/nuevo`
- **Endpoints:** ActividadProfesionalController, AscensosController, BitacoraController, BomberosController, CondicionController, DesignacionesController, EspecialidadesBomberoController, EventosAsistenciaController, FojaServicioController, GruposGuardiaController, GuardiasController, HistorialInstitucionalController, IdiomasController, ImportacionesController, MarcacionesController, NovedadesController, OrdenesGuardiaController, PernoctesController, PublicacionesController, SegurosBomberoController, ServiciosController, SorteosController
- **Servicios:** ActividadProfesionalService, AscensosService, BitacoraService, BomberosService, CondicionService, DesignacionesService, ElegibilidadService, EspecialidadesBomberoService, EventosAsistenciaService, FojaServicioService, GeneracionService, GruposGuardiaService, GuardiasService, HistorialInstitucionalService, IdiomasService, ImportacionesService, MarcacionesService, NovedadesService, OrdenesGuardiaService, PernoctesService, PublicacionesService, SegurosBomberoService, ServiciosService, SorteosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/bombero.entity.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `persisted_in` → [[table--personal-bomberos|personal.bomberos]]

## Referenciado por

- [[service--guardias-bitacora|BitacoraService]] `uses` →
- [[service--guardias-elegibilidad|ElegibilidadService]] `uses` →
- [[service--guardias-generacion|GeneracionService]] `uses` →
- [[service--guardias-grupos-guardia|GruposGuardiaService]] `uses` →
- [[service--guardias-guardias|GuardiasService]] `uses` →
- [[service--guardias-novedades|NovedadesService]] `uses` →
- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `uses` →
- [[service--guardias-pernoctes|PernoctesService]] `uses` →
- [[service--guardias-sorteos|SorteosService]] `uses` →
- [[service--operaciones-eventos-asistencia|EventosAsistenciaService]] `uses` →
- [[service--operaciones-importaciones|ImportacionesService]] `uses` →
- [[service--operaciones-marcaciones|MarcacionesService]] `uses` →
- [[service--organizacion-ascensos|AscensosService]] `uses` →
- [[service--organizacion-designaciones|DesignacionesService]] `uses` →
- [[service--personal-actividad-profesional|ActividadProfesionalService]] `uses` →
- [[service--personal-bomberos|BomberosService]] `uses` →
- [[service--personal-condicion|CondicionService]] `uses` →
- [[service--personal-especialidades-bombero|EspecialidadesBomberoService]] `uses` →
- [[service--personal-foja-servicio|FojaServicioService]] `uses` →
- [[service--personal-historial-institucional|HistorialInstitucionalService]] `uses` →
- [[service--personal-idiomas|IdiomasService]] `uses` →
- [[service--personal-seguros-bombero|SegurosBomberoService]] `uses` →
- [[service--publicaciones-publicaciones|PublicacionesService]] `uses` →
- [[service--servicios-servicios|ServiciosService]] `uses` →
- [[rule--cedula-y-numero-bombero-unicos|Cedula y numero de bombero son unicos en toda la institucion]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
