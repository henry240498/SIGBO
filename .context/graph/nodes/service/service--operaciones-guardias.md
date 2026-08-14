---
id: service--operaciones-guardias
tipo: SERVICE
nombre: GuardiasService
nivel: L2
dominio: asistencia
resumen: Logica de negocio de guardias (modulo operaciones).
capa: backend
archivos:
  - backend/src/modules/operaciones/guardias.service.ts
edges:
  - [belongs_to, domain--asistencia]
  - [uses, component--modulo-operaciones]
  - [uses, entity--guardia]
  - [reads, table--operaciones-guardias]
  - [uses, entity--asignacion-guardia]
  - [reads, table--operaciones-asignacion-guardias]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, service--seguridad-auditoria]
terminos: [guardias, operaciones, guardia, asignacion, bombero]
---

# GuardiasService

Logica de negocio de guardias (modulo operaciones).


## Metodos

`findAll()` · `findOne()` · `create()` · `listarAsignaciones()` · `asignarBombero()` · `quitarAsignacion()`

## Archivos

- `backend/src/modules/operaciones/guardias.service.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `uses` → [[component--modulo-operaciones|operaciones (modulo NestJS)]]
- `uses` → [[entity--guardia|Guardia]]
- `reads` → [[table--operaciones-guardias|operaciones.guardias]]
- `uses` → [[entity--asignacion-guardia|AsignacionGuardia]]
- `reads` → [[table--operaciones-asignacion-guardias|operaciones.asignacion_guardias]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--operaciones-guardias|GuardiasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
