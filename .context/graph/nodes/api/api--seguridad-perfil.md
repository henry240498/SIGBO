---
id: api--seguridad-perfil
tipo: API
nombre: PerfilController
nivel: L2
dominio: seguridad
resumen: Superficie HTTP de perfil bajo /api/v1/seguridad.
prefijo: /api/v1/seguridad
capa: backend
permisos: [seguridad:ver_usuarios, seguridad:editar_usuario]
archivos:
  - backend/src/modules/seguridad/perfil.controller.ts
edges:
  - [belongs_to, domain--seguridad]
  - [exposes, service--seguridad-perfil]
terminos: [perfil, seguridad, ver, usuarios, editar, usuario]
---

# PerfilController

Superficie HTTP de perfil bajo /api/v1/seguridad.

- **Prefijo:** `/api/v1/seguridad`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/seguridad/mi-perfil` | — |
| PUT | `/seguridad/mi-perfil` | — |
| GET | `/seguridad/usuarios/:id/perfil` | `seguridad:ver_usuarios` |
| PUT | `/seguridad/usuarios/:id/perfil` | `seguridad:editar_usuario` |

## Archivos

- `backend/src/modules/seguridad/perfil.controller.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `exposes` → [[service--seguridad-perfil|PerfilService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
