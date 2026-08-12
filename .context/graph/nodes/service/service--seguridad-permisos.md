---
id: service--seguridad-permisos
tipo: SERVICE
nombre: PermisosService
nivel: L2
dominio: seguridad
resumen: Logica de negocio de permisos (modulo seguridad).
capa: backend
archivos:
  - backend/src/modules/seguridad/permisos.service.ts
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--modulo-seguridad]
  - [uses, entity--permiso]
  - [reads, table--seguridad-permisos]
  - [uses, entity--asignacion-permiso-rol]
  - [reads, table--seguridad-asignacion-permisos-rol]
  - [uses, entity--asignacion-permiso-directo]
  - [reads, table--seguridad-asignacion-permisos-directos]
  - [uses, service--seguridad-auditoria]
terminos: [permisos, seguridad, permiso, asignacion, rol, directo]
---

# PermisosService

Logica de negocio de permisos (modulo seguridad).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `eliminar()`

## Archivos

- `backend/src/modules/seguridad/permisos.service.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--modulo-seguridad|seguridad (modulo NestJS)]]
- `uses` → [[entity--permiso|Permiso]]
- `reads` → [[table--seguridad-permisos|seguridad.permisos]]
- `uses` → [[entity--asignacion-permiso-rol|AsignacionPermisoRol]]
- `reads` → [[table--seguridad-asignacion-permisos-rol|seguridad.asignacion_permisos_rol]]
- `uses` → [[entity--asignacion-permiso-directo|AsignacionPermisoDirecto]]
- `reads` → [[table--seguridad-asignacion-permisos-directos|seguridad.asignacion_permisos_directos]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--seguridad-permisos|PermisosController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
