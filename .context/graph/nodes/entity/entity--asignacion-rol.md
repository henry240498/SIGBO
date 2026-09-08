---
id: entity--asignacion-rol
tipo: ENTITY
nombre: AsignacionRol
nivel: L1
dominio: seguridad
resumen: Entidad AsignacionRol, persistida en seguridad.asignacion_roles.
tabla: seguridad.asignacion_roles
archivos:
  - backend/src/shared/entities/asignacion-rol.entity.ts
edges:
  - [belongs_to, domain--seguridad]
  - [persisted_in, table--seguridad-asignacion-roles]
terminos: [asignacion, rol, roles, seguridad]
---

# AsignacionRol

Entidad AsignacionRol, persistida en seguridad.asignacion_roles.

- **Tabla:** [[table--seguridad-asignacion-roles|seguridad.asignacion_roles]]
- **Columnas mapeadas:** 5

## Donde se usa

- **Pantallas:** `/dashboard`, `/dashboard/mi-perfil`, `/dashboard/seguridad/roles`, `/dashboard/seguridad/sesiones`, `/dashboard/seguridad/usuarios`, `/dashboard/seguridad/usuarios/[id]`
- **Endpoints:** AuthController, MeController, RolesController, UsuariosController
- **Servicios:** AuthService, PolicyEngineService, RolesService, UsuariosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/asignacion-rol.entity.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `persisted_in` → [[table--seguridad-asignacion-roles|seguridad.asignacion_roles]]

## Referenciado por

- [[service--auth-auth|AuthService]] `uses` →
- [[service--seguridad-policy-engine|PolicyEngineService]] `uses` →
- [[service--seguridad-roles|RolesService]] `uses` →
- [[service--seguridad-usuarios|UsuariosService]] `uses` →
- [[rule--permisos-efectivos|El permiso efectivo es roles vigentes mas directos concedidos menos directos denegados]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
