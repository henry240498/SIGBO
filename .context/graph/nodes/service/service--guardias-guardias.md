---
id: service--guardias-guardias
tipo: SERVICE
nombre: GuardiasService
nivel: L2
dominio: guardias
resumen: Logica de negocio de guardias (modulo guardias).
capa: backend
archivos:
  - backend/src/modules/guardias/guardias.service.ts
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--modulo-guardias]
  - [uses, entity--guardia]
  - [reads, table--operaciones-guardias]
  - [uses, entity--asignacion-guardia]
  - [reads, table--operaciones-asignacion-guardias]
  - [uses, entity--grupo-guardia-miembro]
  - [reads, table--operaciones-grupos-guardia-miembros]
  - [uses, entity--grupo-guardia]
  - [reads, table--operaciones-grupos-guardia]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--marcacion-asistencia]
  - [reads, table--operaciones-marcaciones-asistencia]
  - [uses, service--seguridad-auditoria]
  - [uses, service--guardias-elegibilidad]
  - [uses, service--guardias-orden-guardia-configuracion]
terminos: [guardias, guardia, asignacion, grupo, miembro, bombero, marcacion, asistencia]
---

# GuardiasService

Logica de negocio de guardias (modulo guardias).


## Metodos

`findAll()` · `findOne()` · `rangoGuardia()` · `create()` · `update()` · `planificarManual()` · `anular()` · `listarAsignaciones()` · `historialPersonal()` · `asignarPersonal()` · `reemplazarAsignacion()` · `quitarAsignacion()` · `registrarHorario()` · `actualizarPresencia()` · `calcularCumplimiento()`

## Archivos

- `backend/src/modules/guardias/guardias.service.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--modulo-guardias|guardias (modulo NestJS)]]
- `uses` → [[entity--guardia|Guardia]]
- `reads` → [[table--operaciones-guardias|operaciones.guardias]]
- `uses` → [[entity--asignacion-guardia|AsignacionGuardia]]
- `reads` → [[table--operaciones-asignacion-guardias|operaciones.asignacion_guardias]]
- `uses` → [[entity--grupo-guardia-miembro|GrupoGuardiaMiembro]]
- `reads` → [[table--operaciones-grupos-guardia-miembros|operaciones.grupos_guardia_miembros]]
- `uses` → [[entity--grupo-guardia|GrupoGuardia]]
- `reads` → [[table--operaciones-grupos-guardia|operaciones.grupos_guardia]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--marcacion-asistencia|MarcacionAsistencia]]
- `reads` → [[table--operaciones-marcaciones-asistencia|operaciones.marcaciones_asistencia]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]
- `uses` → [[service--guardias-elegibilidad|ElegibilidadService]]
- `uses` → [[service--guardias-orden-guardia-configuracion|OrdenGuardiaConfiguracionService]]

## Referenciado por

- [[service--guardias-bitacora|BitacoraService]] `uses` →
- [[service--guardias-generacion|GeneracionService]] `uses` →
- [[service--guardias-sorteos|SorteosService]] `uses` →
- [[api--guardias-guardias|GuardiasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
