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
terminos: [guardia, guardias, operaciones, turno, diurno, nocturno, completo, tipo, registro, ordinaria, especial, extraordinaria, estado, programada, curso, finalizada, cancelada, reemplazada]
---

# Guardia

Guardias programadas reales (schema operaciones). No confundir con organizacion.tipos_guardia, que es el catalogo de tipos.

- **Tabla:** [[table--operaciones-guardias|operaciones.guardias]]
<<<<<<< Updated upstream
- **Columnas mapeadas:** 14
=======
- **Columnas mapeadas:** 8
>>>>>>> Stashed changes

## Estados y enumeraciones

- `TurnoGuardia`: `DIURNO` · `NOCTURNO` · `COMPLETO`
- `TipoGuardiaRegistro`: `ORDINARIA` · `ESPECIAL` · `EXTRAORDINARIA`
- `EstadoGuardia`: `PROGRAMADA` · `EN_CURSO` · `FINALIZADA` · `CANCELADA` · `REEMPLAZADA`

## Archivos

- `backend/src/shared/entities/guardia.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-guardias|operaciones.guardias]]

## Referenciado por

<<<<<<< Updated upstream
- [[service--guardias-guardias|GuardiasService]] `uses` →
- [[service--guardias-inspecciones-estacion|InspeccionesEstacionService]] `uses` →
- [[service--guardias-novedades|NovedadesService]] `uses` →
- [[service--operaciones-dashboard-asistencia|DashboardAsistenciaService]] `uses` →
- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `uses` →
- [[workflow--guardia-y-pernocte|Operacion de una guardia: grupos, asignaciones, presencia, novedades y pernoctes]] `affects` →
=======
- [[service--operaciones-dashboard-asistencia|DashboardAsistenciaService]] `uses` →
- [[service--operaciones-guardias|GuardiasService]] `uses` →
- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `uses` →
>>>>>>> Stashed changes

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
