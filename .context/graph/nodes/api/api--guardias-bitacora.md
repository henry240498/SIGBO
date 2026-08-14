---
id: api--guardias-bitacora
tipo: API
nombre: BitacoraController
nivel: L2
dominio: guardias
resumen: Superficie HTTP de bitacora bajo /api/v1/guardias/:guardiaId.
prefijo: /api/v1/guardias/:guardiaId
capa: backend
permisos: [guardias:ver, guardias:editar]
archivos:
  - backend/src/modules/guardias/bitacora.controller.ts
edges:
  - [belongs_to, domain--guardias]
  - [exposes, service--guardias-bitacora]
terminos: [bitacora, guardias, guardia, ver, editar]
---

# BitacoraController

Superficie HTTP de bitacora bajo /api/v1/guardias/:guardiaId.

- **Prefijo:** `/api/v1/guardias/:guardiaId`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/guardias/:guardiaId/bitacora` | `guardias:ver` |
| POST | `/guardias/:guardiaId/cerrar` | `guardias:editar` |
| POST | `/guardias/:guardiaId/reabrir` | `guardias:editar` |

## Archivos

- `backend/src/modules/guardias/bitacora.controller.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `exposes` → [[service--guardias-bitacora|BitacoraService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
