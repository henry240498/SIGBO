---
id: table--seguridad-asignacion-permisos-directos
tipo: TABLE
nombre: seguridad.asignacion_permisos_directos
nivel: L2
dominio: seguridad
resumen: Tabla seguridad.asignacion_permisos_directos (7 columnas). Creada en 002_seguridad.sql, modificada por 009_foreign_keys.sql.
tabla: asignacion_permisos_directos
archivos:
  - database/migrations/002_seguridad.sql
  - database/migrations/009_foreign_keys.sql
edges:
  - [defined_in, file--002-seguridad]
  - [belongs_to, domain--seguridad]
terminos: [seguridad, asignacion, permisos, directos, usuario, permiso, concedido, fecha, asignado, motivo]
---

# seguridad.asignacion_permisos_directos

Tabla seguridad.asignacion_permisos_directos (7 columnas). Creada en 002_seguridad.sql, modificada por 009_foreign_keys.sql.

- **Esquema:** seguridad · **Columnas:** 7
- **UNIQUE:** `usuario_id, permiso_id`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| usuario_id | UNIQUEIDENTIFIER |
| permiso_id | UNIQUEIDENTIFIER |
| concedido | BIT |
| fecha_asignacion | DATETIMEOFFSET(3) |
| asignado_por | UNIQUEIDENTIFIER |
| motivo | NVARCHAR(MAX) |

## Donde se usa

- **Pantallas:** `/dashboard/mi-perfil`, `/dashboard/seguridad/permisos`, `/dashboard/seguridad/roles`, `/dashboard/seguridad/sesiones`, `/dashboard/seguridad/usuarios`, `/dashboard/seguridad/usuarios/[id]`
- **Endpoints:** MeController, PermisosController, UsuariosController
- **Servicios:** PermisosService, PolicyEngineService, UsuariosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/002_seguridad.sql`
- `database/migrations/009_foreign_keys.sql`

## Relaciones

- `defined_in` → [[file--002-seguridad|002_seguridad.sql]]
- `belongs_to` → [[domain--seguridad|Seguridad]]

## Referenciado por

- [[entity--asignacion-permiso-directo|AsignacionPermisoDirecto]] `persisted_in` →
- [[service--seguridad-permisos|PermisosService]] `reads` →
- [[service--seguridad-policy-engine|PolicyEngineService]] `reads` →
- [[service--seguridad-usuarios|UsuariosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
