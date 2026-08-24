---
id: api--auth-auth
tipo: API
nombre: AuthController
nivel: L2
dominio: seguridad
resumen: Superficie HTTP de auth bajo /api/v1/auth.
prefijo: /api/v1/auth
capa: backend
archivos:
  - backend/src/modules/auth/auth.controller.ts
edges:
  - [belongs_to, domain--seguridad]
  - [exposes, service--auth-auth]
terminos: [auth]
---

# AuthController

Superficie HTTP de auth bajo /api/v1/auth.

- **Prefijo:** `/api/v1/auth`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| POST | `/auth/logout` | — |

## Archivos

- `backend/src/modules/auth/auth.controller.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `exposes` → [[service--auth-auth|AuthService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
