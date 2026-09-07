---
id: entity--rol
tipo: ENTITY
nombre: Rol
nivel: L1
dominio: seguridad
resumen: Entidad Rol, persistida en seguridad.roles.
tabla: seguridad.roles
archivos:
  - backend/src/shared/entities/rol.entity.ts
edges:
  - [belongs_to, domain--seguridad]
  - [persisted_in, table--seguridad-roles]
terminos: [rol, roles, seguridad]
---

# Rol

Entidad Rol, persistida en seguridad.roles.

- **Tabla:** [[table--seguridad-roles|seguridad.roles]]
- **Columnas mapeadas:** 14

## Donde se usa

- **Pantallas:** `/dashboard/mi-perfil`, `/dashboard/organizacion`, `/dashboard/seguridad`, `/dashboard/seguridad/roles`, `/dashboard/seguridad/sesiones`, `/dashboard/seguridad/usuarios`, `/dashboard/seguridad/usuarios/[id]`
- **Endpoints:** AuthController, DashboardController, DashboardController, MeController, RolesController, UsuariosController
- **Servicios:** AuthService, DashboardService, PolicyEngineService, RolesService, UsuariosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/rol.entity.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `persisted_in` → [[table--seguridad-roles|seguridad.roles]]

## Referenciado por

- [[service--auth-auth|AuthService]] `uses` →
- [[service--seguridad-dashboard|DashboardService]] `uses` →
- [[service--seguridad-policy-engine|PolicyEngineService]] `uses` →
- [[service--seguridad-roles|RolesService]] `uses` →
- [[service--seguridad-usuarios|UsuariosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
