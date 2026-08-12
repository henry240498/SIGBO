---
id: api--seguridad-roles
tipo: API
nombre: RolesController
nivel: L2
dominio: seguridad
resumen: Superficie HTTP de roles bajo /api/v1/seguridad/roles.
prefijo: /api/v1/seguridad/roles
capa: backend
permisos: [seguridad:ver_usuarios, seguridad:crear_rol, seguridad:editar_rol, seguridad:eliminar_rol]
archivos:
  - backend/src/modules/seguridad/roles.controller.ts
edges:
  - [belongs_to, domain--seguridad]
  - [exposes, service--seguridad-roles]
terminos: [roles, seguridad, ver, usuarios, crear, rol, editar, eliminar]
---

# RolesController

Superficie HTTP de roles bajo /api/v1/seguridad/roles.

- **Prefijo:** `/api/v1/seguridad/roles`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/seguridad/roles` | `seguridad:ver_usuarios` |
| GET | `/seguridad/roles/:id` | `seguridad:ver_usuarios` |
| GET | `/seguridad/roles/:id/permisos` | `seguridad:ver_usuarios` |
| POST | `/seguridad/roles` | `seguridad:crear_rol` |
| PATCH | `/seguridad/roles/:id` | `seguridad:editar_rol` |
| DELETE | `/seguridad/roles/:id` | `seguridad:eliminar_rol` |
| PATCH | `/seguridad/roles/:id/activo` | `seguridad:editar_rol` |
| POST | `/seguridad/roles/:id/duplicar` | `seguridad:crear_rol` |
| POST | `/seguridad/roles/:id/copiar-permisos` | `seguridad:editar_rol` |
| PUT | `/seguridad/roles/:id/permisos` | `seguridad:editar_rol` |

## Archivos

- `backend/src/modules/seguridad/roles.controller.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `exposes` → [[service--seguridad-roles|RolesService]]

## Referenciado por

- [[screen--dashboard-seguridad-roles|/dashboard/seguridad/roles]] `calls` →
- [[screen--dashboard-seguridad-roles|/dashboard/seguridad/roles]] `calls` →
- [[screen--dashboard-seguridad-usuarios|/dashboard/seguridad/usuarios]] `calls` →
- [[screen--dashboard-seguridad-usuarios-id|/dashboard/seguridad/usuarios/[id]]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
