---
id: api--seguridad-me
tipo: API
nombre: MeController
nivel: L2
dominio: seguridad
resumen: Superficie HTTP de me bajo /api/v1/seguridad.
prefijo: /api/v1/seguridad
capa: backend
archivos:
  - backend/src/modules/seguridad/me.controller.ts
edges:
  - [belongs_to, domain--seguridad]
  - [exposes, service--seguridad-usuarios]
terminos: [seguridad]
---

# MeController

Superficie HTTP de me bajo /api/v1/seguridad.

- **Prefijo:** `/api/v1/seguridad`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/seguridad/mis-permisos` | — |
| GET | `/seguridad/mis-roles` | — |
| POST | `/seguridad/me/password` | — |

## Archivos

- `backend/src/modules/seguridad/me.controller.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `exposes` → [[service--seguridad-usuarios|UsuariosService]]

## Referenciado por

- [[screen--dashboard-mi-perfil|/dashboard/mi-perfil]] `calls` →
- [[screen--dashboard-mi-perfil|/dashboard/mi-perfil]] `calls` →
- [[screen--dashboard|/dashboard]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
