---
id: service--seguridad-roles
tipo: SERVICE
nombre: RolesService
nivel: L2
dominio: seguridad
resumen: Logica de negocio de roles (modulo seguridad).
capa: backend
archivos:
  - backend/src/modules/seguridad/roles.service.ts
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--modulo-seguridad]
  - [uses, entity--rol]
  - [reads, table--seguridad-roles]
  - [uses, entity--asignacion-permiso-rol]
  - [reads, table--seguridad-asignacion-permisos-rol]
  - [uses, entity--asignacion-rol]
  - [reads, table--seguridad-asignacion-roles]
  - [uses, entity--permiso]
  - [reads, table--seguridad-permisos]
  - [uses, service--seguridad-auditoria]
terminos: [roles, seguridad, rol, asignacion, permiso]
---

# RolesService

Logica de negocio de roles (modulo seguridad).


## Metodos

`findAll()` · `findOne()` · `getPermisos()` · `create()` · `update()` · `eliminar()` · `activar()` · `duplicar()` · `copiarPermisos()` · `setPermisos()`

## Archivos

- `backend/src/modules/seguridad/roles.service.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--modulo-seguridad|seguridad (modulo NestJS)]]
- `uses` → [[entity--rol|Rol]]
- `reads` → [[table--seguridad-roles|seguridad.roles]]
- `uses` → [[entity--asignacion-permiso-rol|AsignacionPermisoRol]]
- `reads` → [[table--seguridad-asignacion-permisos-rol|seguridad.asignacion_permisos_rol]]
- `uses` → [[entity--asignacion-rol|AsignacionRol]]
- `reads` → [[table--seguridad-asignacion-roles|seguridad.asignacion_roles]]
- `uses` → [[entity--permiso|Permiso]]
- `reads` → [[table--seguridad-permisos|seguridad.permisos]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--seguridad-roles|RolesController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
