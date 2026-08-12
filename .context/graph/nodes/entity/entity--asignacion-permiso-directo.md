---
id: entity--asignacion-permiso-directo
tipo: ENTITY
nombre: AsignacionPermisoDirecto
nivel: L1
dominio: seguridad
resumen: Entidad AsignacionPermisoDirecto, persistida en seguridad.asignacion_permisos_directos.
tabla: seguridad.asignacion_permisos_directos
archivos:
  - backend/src/shared/entities/asignacion-permiso-directo.entity.ts
edges:
  - [belongs_to, domain--seguridad]
  - [persisted_in, table--seguridad-asignacion-permisos-directos]
terminos: [asignacion, permiso, directo, permisos, directos, seguridad]
---

# AsignacionPermisoDirecto

Entidad AsignacionPermisoDirecto, persistida en seguridad.asignacion_permisos_directos.

- **Tabla:** [[table--seguridad-asignacion-permisos-directos|seguridad.asignacion_permisos_directos]]
- **Columnas mapeadas:** 5

## Archivos

- `backend/src/shared/entities/asignacion-permiso-directo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `persisted_in` → [[table--seguridad-asignacion-permisos-directos|seguridad.asignacion_permisos_directos]]

## Referenciado por

- [[service--seguridad-permisos|PermisosService]] `uses` →
- [[service--seguridad-policy-engine|PolicyEngineService]] `uses` →
- [[service--seguridad-usuarios|UsuariosService]] `uses` →
- [[rule--permisos-efectivos|El permiso efectivo es roles vigentes mas directos concedidos menos directos denegados]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
