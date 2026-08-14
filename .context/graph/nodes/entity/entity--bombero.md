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
- **Columnas mapeadas:** 54

## Estados y enumeraciones

- `EstadoBombero`: `ASPIRANTE` · `ACTIVO` · `SUSPENDIDO` · `LICENCIA` · `RETIRADO` · `FALLECIDO` · `HONORARIO`
- `CondicionInstitucional`: `INCORPORADO` · `COMBATIENTE` · `APOYO_ECONOMICO` · `HONORARIO`

## Archivos

- `backend/src/shared/entities/bombero.entity.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `persisted_in` → [[table--personal-bomberos|personal.bomberos]]

## Referenciado por

<<<<<<< Updated upstream
- [[service--guardias-elegibilidad|ElegibilidadService]] `uses` →
- [[service--guardias-grupos-guardia|GruposGuardiaService]] `uses` →
- [[service--guardias-guardias|GuardiasService]] `uses` →
- [[service--guardias-novedades|NovedadesService]] `uses` →
- [[service--guardias-pernoctes|PernoctesService]] `uses` →
- [[service--operaciones-eventos-asistencia|EventosAsistenciaService]] `uses` →
=======
- [[service--operaciones-eventos-asistencia|EventosAsistenciaService]] `uses` →
- [[service--operaciones-guardias|GuardiasService]] `uses` →
>>>>>>> Stashed changes
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
