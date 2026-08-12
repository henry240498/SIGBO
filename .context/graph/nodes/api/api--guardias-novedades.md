---
id: api--guardias-novedades
tipo: API
nombre: NovedadesController
nivel: L2
dominio: guardias
resumen: Superficie HTTP de novedades bajo /api/v1/guardias/:guardiaId/novedades.
prefijo: /api/v1/guardias/:guardiaId/novedades
capa: backend
permisos: [guardias:ver, guardias:editar]
archivos:
  - backend/src/modules/guardias/novedades.controller.ts
edges:
  - [belongs_to, domain--guardias]
  - [exposes, service--guardias-novedades]
terminos: [novedades, guardias, guardia, ver, editar]
---

# NovedadesController

Superficie HTTP de novedades bajo /api/v1/guardias/:guardiaId/novedades.

- **Prefijo:** `/api/v1/guardias/:guardiaId/novedades`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/guardias/:guardiaId/novedades` | `guardias:ver` |
| POST | `/guardias/:guardiaId/novedades` | `guardias:editar` |

## Archivos

- `backend/src/modules/guardias/novedades.controller.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `exposes` → [[service--guardias-novedades|NovedadesService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
