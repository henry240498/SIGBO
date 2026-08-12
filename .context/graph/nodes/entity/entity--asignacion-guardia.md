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

## Archivos

- `backend/src/shared/entities/asignacion-guardia.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-asignacion-guardias|operaciones.asignacion_guardias]]

## Referenciado por

- [[service--guardias-guardias|GuardiasService]] `uses` →
- [[service--operaciones-dashboard-asistencia|DashboardAsistenciaService]] `uses` →
- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `uses` →
- [[workflow--guardia-y-pernocte|Operacion de una guardia: grupos, asignaciones, presencia, novedades y pernoctes]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
