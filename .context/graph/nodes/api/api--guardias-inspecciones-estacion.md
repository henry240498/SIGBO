---
id: api--guardias-inspecciones-estacion
tipo: API
nombre: InspeccionesEstacionController
nivel: L2
dominio: guardias
resumen: Superficie HTTP de inspecciones estacion bajo /api/v1/guardias/:guardiaId/inspecciones-estacion.
prefijo: /api/v1/guardias/:guardiaId/inspecciones-estacion
capa: backend
permisos: [guardias:ver, guardias:editar]
archivos:
  - backend/src/modules/guardias/inspecciones-estacion.controller.ts
edges:
  - [belongs_to, domain--guardias]
  - [exposes, service--guardias-inspecciones-estacion]
terminos: [inspecciones, estacion, guardias, guardia, ver, editar]
---

# InspeccionesEstacionController

Superficie HTTP de inspecciones estacion bajo /api/v1/guardias/:guardiaId/inspecciones-estacion.

- **Prefijo:** `/api/v1/guardias/:guardiaId/inspecciones-estacion`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/guardias/:guardiaId/inspecciones-estacion` | `guardias:ver` |
| POST | `/guardias/:guardiaId/inspecciones-estacion` | `guardias:editar` |

## Archivos

- `backend/src/modules/guardias/inspecciones-estacion.controller.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `exposes` → [[service--guardias-inspecciones-estacion|InspeccionesEstacionService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
