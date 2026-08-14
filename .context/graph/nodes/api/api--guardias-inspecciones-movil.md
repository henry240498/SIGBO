---
id: api--guardias-inspecciones-movil
tipo: API
nombre: InspeccionesMovilController
nivel: L2
dominio: guardias
resumen: Superficie HTTP de inspecciones movil bajo /api/v1/guardias/:guardiaId/inspecciones-movil.
prefijo: /api/v1/guardias/:guardiaId/inspecciones-movil
capa: backend
permisos: [guardias:ver, guardias:editar]
archivos:
  - backend/src/modules/guardias/inspecciones-movil.controller.ts
edges:
  - [belongs_to, domain--guardias]
  - [exposes, service--guardias-inspecciones-movil]
terminos: [inspecciones, movil, guardias, guardia, ver, editar]
---

# InspeccionesMovilController

Superficie HTTP de inspecciones movil bajo /api/v1/guardias/:guardiaId/inspecciones-movil.

- **Prefijo:** `/api/v1/guardias/:guardiaId/inspecciones-movil`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/guardias/:guardiaId/inspecciones-movil/a-revisar` | `guardias:ver` |
| GET | `/guardias/:guardiaId/inspecciones-movil` | `guardias:ver` |
| POST | `/guardias/:guardiaId/inspecciones-movil` | `guardias:editar` |

## Archivos

- `backend/src/modules/guardias/inspecciones-movil.controller.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `exposes` → [[service--guardias-inspecciones-movil|InspeccionesMovilService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
