---
id: entity--permiso
tipo: ENTITY
nombre: Permiso
nivel: L1
dominio: seguridad
resumen: Entidad Permiso, persistida en seguridad.permisos.
tabla: seguridad.permisos
archivos:
  - backend/src/shared/entities/permiso.entity.ts
edges:
  - [belongs_to, domain--seguridad]
  - [persisted_in, table--seguridad-permisos]
terminos: [permiso, permisos, seguridad]
---

# Permiso

Entidad Permiso, persistida en seguridad.permisos.

- **Tabla:** [[table--seguridad-permisos|seguridad.permisos]]
- **Columnas mapeadas:** 7

## Donde se usa

- **Pantallas:** `/dashboard`, `/dashboard/mi-perfil`, `/dashboard/organizacion`, `/dashboard/seguridad`, `/dashboard/seguridad/permisos`, `/dashboard/seguridad/roles`, `/dashboard/seguridad/sesiones`, `/dashboard/seguridad/usuarios`, `/dashboard/seguridad/usuarios/[id]`
- **Endpoints:** DashboardController, DashboardController, MeController, PermisosController, RolesController, UsuariosController
- **Servicios:** DashboardService, PermisosService, PolicyEngineService, RolesService, UsuariosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/permiso.entity.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `persisted_in` → [[table--seguridad-permisos|seguridad.permisos]]

## Referenciado por

- [[service--seguridad-dashboard|DashboardService]] `uses` →
- [[service--seguridad-permisos|PermisosService]] `uses` →
- [[service--seguridad-policy-engine|PolicyEngineService]] `uses` →
- [[service--seguridad-roles|RolesService]] `uses` →
- [[service--seguridad-usuarios|UsuariosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
