---
id: service--operaciones-marcaciones
tipo: SERVICE
nombre: MarcacionesService
nivel: L2
dominio: asistencia
resumen: Logica de negocio de marcaciones (modulo operaciones).
capa: backend
archivos:
  - backend/src/modules/operaciones/marcaciones.service.ts
edges:
  - [belongs_to, domain--asistencia]
  - [uses, component--modulo-operaciones]
  - [uses, entity--marcacion-asistencia]
  - [reads, table--operaciones-marcaciones-asistencia]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, service--seguridad-auditoria]
terminos: [marcaciones, operaciones, marcacion, asistencia, bombero]
---

# MarcacionesService

Logica de negocio de marcaciones (modulo operaciones).


## Metodos

`registrarManual()` · `listarPorBombero()` · `listarDelDia()` · `buscar()` · `bomberosEnCuartelAhora()`

## Archivos

- `backend/src/modules/operaciones/marcaciones.service.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `uses` → [[component--modulo-operaciones|operaciones (modulo NestJS)]]
- `uses` → [[entity--marcacion-asistencia|MarcacionAsistencia]]
- `reads` → [[table--operaciones-marcaciones-asistencia|operaciones.marcaciones_asistencia]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[service--operaciones-dashboard-asistencia|DashboardAsistenciaService]] `uses` →
- [[api--operaciones-marcaciones|MarcacionesController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
