---
id: entity--asignacion-permiso-rol
tipo: ENTITY
nombre: AsignacionPermisoRol
nivel: L1
dominio: seguridad
resumen: Entidad AsignacionPermisoRol, persistida en seguridad.asignacion_permisos_rol.
tabla: seguridad.asignacion_permisos_rol
archivos:
  - backend/src/shared/entities/asignacion-permiso-rol.entity.ts
edges:
  - [belongs_to, domain--seguridad]
  - [persisted_in, table--seguridad-asignacion-permisos-rol]
terminos: [asignacion, permiso, rol, permisos, seguridad]
---

# AsignacionPermisoRol

Entidad AsignacionPermisoRol, persistida en seguridad.asignacion_permisos_rol.

- **Tabla:** [[table--seguridad-asignacion-permisos-rol|seguridad.asignacion_permisos_rol]]
- **Columnas mapeadas:** 3

## Archivos

- `backend/src/shared/entities/asignacion-permiso-rol.entity.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `persisted_in` → [[table--seguridad-asignacion-permisos-rol|seguridad.asignacion_permisos_rol]]

## Referenciado por

- [[service--seguridad-permisos|PermisosService]] `uses` →
- [[service--seguridad-policy-engine|PolicyEngineService]] `uses` →
- [[service--seguridad-roles|RolesService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
