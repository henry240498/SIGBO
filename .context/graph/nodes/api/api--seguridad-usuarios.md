---
id: api--seguridad-usuarios
tipo: API
nombre: UsuariosController
nivel: L2
dominio: seguridad
resumen: Superficie HTTP de usuarios bajo /api/v1/seguridad/usuarios.
prefijo: /api/v1/seguridad/usuarios
capa: backend
permisos: [seguridad:ver_usuarios, seguridad:crear_usuario, seguridad:editar_usuario, seguridad:eliminar_usuario, seguridad:cerrar_sesion]
archivos:
  - backend/src/modules/seguridad/usuarios.controller.ts
edges:
  - [belongs_to, domain--seguridad]
  - [exposes, service--seguridad-usuarios]
terminos: [usuarios, seguridad, ver, crear, usuario, editar, eliminar, cerrar, sesion]
---

# UsuariosController

Superficie HTTP de usuarios bajo /api/v1/seguridad/usuarios.

- **Prefijo:** `/api/v1/seguridad/usuarios`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/seguridad/usuarios` | `seguridad:ver_usuarios` |
| GET | `/seguridad/usuarios/:id` | `seguridad:ver_usuarios` |
| GET | `/seguridad/usuarios/:id/detalle` | `seguridad:ver_usuarios` |
| GET | `/seguridad/usuarios/:id/roles` | `seguridad:ver_usuarios` |
| POST | `/seguridad/usuarios` | `seguridad:crear_usuario` |
| PATCH | `/seguridad/usuarios/:id` | `seguridad:editar_usuario` |
| PATCH | `/seguridad/usuarios/:id/baja` | `seguridad:eliminar_usuario` |
| PATCH | `/seguridad/usuarios/:id/bloqueo` | `seguridad:editar_usuario` |
| PATCH | `/seguridad/usuarios/:id/password` | `seguridad:editar_usuario` |
| PUT | `/seguridad/usuarios/:id/roles` | `seguridad:editar_usuario` |
| PUT | `/seguridad/usuarios/:id/permisos` | `seguridad:editar_usuario` |
| DELETE | `/seguridad/usuarios/:id/permisos/:permisoId` | `seguridad:editar_usuario` |
| POST | `/seguridad/usuarios/:id/cerrar-sesiones` | `seguridad:cerrar_sesion` |

## Archivos

- `backend/src/modules/seguridad/usuarios.controller.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `exposes` → [[service--seguridad-usuarios|UsuariosService]]

## Referenciado por

- [[screen--dashboard-seguridad-sesiones|/dashboard/seguridad/sesiones]] `calls` →
- [[screen--dashboard-seguridad-usuarios|/dashboard/seguridad/usuarios]] `calls` →
- [[screen--dashboard-seguridad-usuarios|/dashboard/seguridad/usuarios]] `calls` →
- [[screen--dashboard-seguridad-usuarios-id|/dashboard/seguridad/usuarios/[id]]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
