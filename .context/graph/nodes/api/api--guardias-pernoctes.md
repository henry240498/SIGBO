---
id: api--guardias-pernoctes
tipo: API
nombre: PernoctesController
nivel: L2
dominio: guardias
resumen: Superficie HTTP de pernoctes bajo /api/v1/guardias/pernoctes.
prefijo: /api/v1/guardias/pernoctes
capa: backend
permisos: [guardias:ver, guardias:editar]
archivos:
  - backend/src/modules/guardias/pernoctes.controller.ts
edges:
  - [belongs_to, domain--guardias]
  - [exposes, service--guardias-pernoctes]
terminos: [pernoctes, guardias, ver, editar]
---

# PernoctesController

Superficie HTTP de pernoctes bajo /api/v1/guardias/pernoctes.

- **Prefijo:** `/api/v1/guardias/pernoctes`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/guardias/pernoctes` | `guardias:ver` |
| POST | `/guardias/pernoctes` | `guardias:editar` |
| PATCH | `/guardias/pernoctes/:id/salida` | `guardias:editar` |

## Archivos

- `backend/src/modules/guardias/pernoctes.controller.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `exposes` → [[service--guardias-pernoctes|PernoctesService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
