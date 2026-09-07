---
id: service--seguridad-policy-engine
tipo: SERVICE
nombre: PolicyEngineService
nivel: L2
dominio: seguridad
resumen: Logica de negocio de policy engine (modulo seguridad).
capa: backend
archivos:
  - backend/src/modules/seguridad/policy-engine.service.ts
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--modulo-seguridad]
  - [uses, entity--asignacion-rol]
  - [reads, table--seguridad-asignacion-roles]
  - [uses, entity--asignacion-permiso-rol]
  - [reads, table--seguridad-asignacion-permisos-rol]
  - [uses, entity--asignacion-permiso-directo]
  - [reads, table--seguridad-asignacion-permisos-directos]
  - [uses, entity--permiso]
  - [reads, table--seguridad-permisos]
  - [uses, entity--rol]
  - [reads, table--seguridad-roles]
terminos: [policy, engine, seguridad, asignacion, rol, permiso, directo]
---

# PolicyEngineService

Logica de negocio de policy engine (modulo seguridad).


## Metodos

`getPermisosEfectivos()`

## Archivos

- `backend/src/modules/seguridad/policy-engine.service.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--modulo-seguridad|seguridad (modulo NestJS)]]
- `uses` → [[entity--asignacion-rol|AsignacionRol]]
- `reads` → [[table--seguridad-asignacion-roles|seguridad.asignacion_roles]]
- `uses` → [[entity--asignacion-permiso-rol|AsignacionPermisoRol]]
- `reads` → [[table--seguridad-asignacion-permisos-rol|seguridad.asignacion_permisos_rol]]
- `uses` → [[entity--asignacion-permiso-directo|AsignacionPermisoDirecto]]
- `reads` → [[table--seguridad-asignacion-permisos-directos|seguridad.asignacion_permisos_directos]]
- `uses` → [[entity--permiso|Permiso]]
- `reads` → [[table--seguridad-permisos|seguridad.permisos]]
- `uses` → [[entity--rol|Rol]]
- `reads` → [[table--seguridad-roles|seguridad.roles]]

## Referenciado por

- [[service--auth-auth|AuthService]] `uses` →
- [[service--seguridad-usuarios|UsuariosService]] `uses` →
- [[rule--permisos-efectivos|El permiso efectivo es roles vigentes mas directos concedidos menos directos denegados]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
