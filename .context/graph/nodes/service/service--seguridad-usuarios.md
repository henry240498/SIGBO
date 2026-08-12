---
id: service--seguridad-usuarios
tipo: SERVICE
nombre: UsuariosService
nivel: L2
dominio: seguridad
resumen: Logica de negocio de usuarios (modulo seguridad).
capa: backend
archivos:
  - backend/src/modules/seguridad/usuarios.service.ts
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--modulo-seguridad]
  - [uses, entity--usuario]
  - [reads, table--seguridad-usuarios]
  - [uses, entity--asignacion-rol]
  - [reads, table--seguridad-asignacion-roles]
  - [uses, entity--rol]
  - [reads, table--seguridad-roles]
  - [uses, entity--permiso]
  - [reads, table--seguridad-permisos]
  - [uses, entity--asignacion-permiso-directo]
  - [reads, table--seguridad-asignacion-permisos-directos]
  - [uses, entity--historial-contrasena]
  - [reads, table--seguridad-historial-contrasenas]
  - [uses, service--seguridad-auditoria]
  - [uses, service--seguridad-sesiones]
  - [uses, service--seguridad-policy-engine]
terminos: [usuarios, seguridad, usuario, asignacion, rol, permiso, directo, historial, contrasena]
---

# UsuariosService

Logica de negocio de usuarios (modulo seguridad).


## Metodos

`findAll()` · `findOne()` · `getRoles()` · `detalle()` · `getPermisosDirectos()` · `create()` · `update()` · `darBaja()` · `bloquear()` · `resetearPassword()` · `cambiarPasswordPropia()` · `reemplazarRoles()` · `asignarPermisoDirecto()` · `quitarPermisoDirecto()` · `cerrarSesiones()`

## Archivos

- `backend/src/modules/seguridad/usuarios.service.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--modulo-seguridad|seguridad (modulo NestJS)]]
- `uses` → [[entity--usuario|Usuario]]
- `reads` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `uses` → [[entity--asignacion-rol|AsignacionRol]]
- `reads` → [[table--seguridad-asignacion-roles|seguridad.asignacion_roles]]
- `uses` → [[entity--rol|Rol]]
- `reads` → [[table--seguridad-roles|seguridad.roles]]
- `uses` → [[entity--permiso|Permiso]]
- `reads` → [[table--seguridad-permisos|seguridad.permisos]]
- `uses` → [[entity--asignacion-permiso-directo|AsignacionPermisoDirecto]]
- `reads` → [[table--seguridad-asignacion-permisos-directos|seguridad.asignacion_permisos_directos]]
- `uses` → [[entity--historial-contrasena|HistorialContrasena]]
- `reads` → [[table--seguridad-historial-contrasenas|seguridad.historial_contrasenas]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]
- `uses` → [[service--seguridad-sesiones|SesionesService]]
- `uses` → [[service--seguridad-policy-engine|PolicyEngineService]]

## Referenciado por

- [[api--seguridad-me|MeController]] `exposes` →
- [[api--seguridad-usuarios|UsuariosController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
