---
id: table--seguridad-asignacion-permisos-rol
tipo: TABLE
nombre: seguridad.asignacion_permisos_rol
nivel: L2
dominio: seguridad
resumen: Tabla seguridad.asignacion_permisos_rol (5 columnas). Creada en 002_seguridad.sql, modificada por 009_foreign_keys.sql.
tabla: asignacion_permisos_rol
archivos:
  - database/migrations/002_seguridad.sql
  - database/migrations/009_foreign_keys.sql
edges:
  - [defined_in, file--002-seguridad]
  - [belongs_to, domain--seguridad]
terminos: [seguridad, asignacion, permisos, rol, permiso, fecha, asignado]
---

# seguridad.asignacion_permisos_rol

Tabla seguridad.asignacion_permisos_rol (5 columnas). Creada en 002_seguridad.sql, modificada por 009_foreign_keys.sql.

- **Esquema:** seguridad · **Columnas:** 5
- **UNIQUE:** `rol_id, permiso_id`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| rol_id | UNIQUEIDENTIFIER |
| permiso_id | UNIQUEIDENTIFIER |
| fecha_asignacion | DATETIMEOFFSET(3) |
| asignado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/seguridad/permisos`, `/dashboard/seguridad/roles`, `/dashboard/seguridad/usuarios`, `/dashboard/seguridad/usuarios/[id]`
- **Endpoints:** PermisosController, RolesController
- **Servicios:** PermisosService, PolicyEngineService, RolesService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/002_seguridad.sql`
- `database/migrations/009_foreign_keys.sql`

## Relaciones

- `defined_in` → [[file--002-seguridad|002_seguridad.sql]]
- `belongs_to` → [[domain--seguridad|Seguridad]]

## Referenciado por

- [[entity--asignacion-permiso-rol|AsignacionPermisoRol]] `persisted_in` →
- [[service--seguridad-permisos|PermisosService]] `reads` →
- [[service--seguridad-policy-engine|PolicyEngineService]] `reads` →
- [[service--seguridad-roles|RolesService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
