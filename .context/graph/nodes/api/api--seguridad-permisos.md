---
id: api--seguridad-permisos
tipo: API
nombre: PermisosController
nivel: L2
dominio: seguridad
resumen: Superficie HTTP de permisos bajo /api/v1/seguridad/permisos.
prefijo: /api/v1/seguridad/permisos
capa: backend
permisos: [seguridad:ver_usuarios, seguridad:crear_permiso, seguridad:editar_permiso, seguridad:eliminar_permiso]
archivos:
  - backend/src/modules/seguridad/permisos.controller.ts
edges:
  - [belongs_to, domain--seguridad]
  - [exposes, service--seguridad-permisos]
terminos: [permisos, seguridad, ver, usuarios, crear, permiso, editar, eliminar]
---

# PermisosController

Superficie HTTP de permisos bajo /api/v1/seguridad/permisos.

- **Prefijo:** `/api/v1/seguridad/permisos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/seguridad/permisos` | `seguridad:ver_usuarios` |
| POST | `/seguridad/permisos` | `seguridad:crear_permiso` |
| PATCH | `/seguridad/permisos/:id` | `seguridad:editar_permiso` |
| DELETE | `/seguridad/permisos/:id` | `seguridad:eliminar_permiso` |

## Archivos

- `backend/src/modules/seguridad/permisos.controller.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `exposes` → [[service--seguridad-permisos|PermisosService]]

## Referenciado por

- [[screen--dashboard-seguridad-permisos|/dashboard/seguridad/permisos]] `calls` →
- [[screen--dashboard-seguridad-permisos|/dashboard/seguridad/permisos]] `calls` →
- [[screen--dashboard-seguridad-roles|/dashboard/seguridad/roles]] `calls` →
- [[screen--dashboard-seguridad-usuarios-id|/dashboard/seguridad/usuarios/[id]]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
