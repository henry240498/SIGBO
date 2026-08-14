---
id: api--guardias-grupos-guardia
tipo: API
nombre: GruposGuardiaController
nivel: L2
dominio: guardias
resumen: Superficie HTTP de grupos guardia bajo /api/v1/guardias/grupos.
prefijo: /api/v1/guardias/grupos
capa: backend
permisos: [guardias:ver, guardias:crear, guardias:editar]
archivos:
  - backend/src/modules/guardias/grupos-guardia.controller.ts
edges:
  - [belongs_to, domain--guardias]
  - [exposes, service--guardias-grupos-guardia]
terminos: [grupos, guardia, guardias, ver, crear, editar]
---

# GruposGuardiaController

Superficie HTTP de grupos guardia bajo /api/v1/guardias/grupos.

- **Prefijo:** `/api/v1/guardias/grupos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/guardias/grupos` | `guardias:ver` |
| GET | `/guardias/grupos/:id` | `guardias:ver` |
| POST | `/guardias/grupos` | `guardias:crear` |
| PATCH | `/guardias/grupos/:id` | `guardias:editar` |
| GET | `/guardias/grupos/:id/historial` | `guardias:ver` |
| GET | `/guardias/grupos/:id/miembros` | `guardias:ver` |
| POST | `/guardias/grupos/:id/miembros` | `guardias:editar` |
| DELETE | `/guardias/grupos/:id/miembros/:miembroId` | `guardias:editar` |

## Archivos

- `backend/src/modules/guardias/grupos-guardia.controller.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `exposes` → [[service--guardias-grupos-guardia|GruposGuardiaService]]

## Referenciado por

- [[component--front-guardias|guardias]] `calls` →
- [[component--front-guardias|guardias]] `calls` →
- [[component--front-guardias|guardias]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
