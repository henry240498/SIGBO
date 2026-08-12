---
id: api--guardias-guardias
tipo: API
nombre: GuardiasController
nivel: L2
dominio: guardias
resumen: Superficie HTTP de guardias bajo /api/v1/guardias.
prefijo: /api/v1/guardias
capa: backend
permisos: [guardias:ver, guardias:crear, guardias:asignar, guardias:editar]
archivos:
  - backend/src/modules/guardias/guardias.controller.ts
edges:
  - [belongs_to, domain--guardias]
  - [exposes, service--guardias-guardias]
terminos: [guardias, ver, crear, asignar, editar]
---

# GuardiasController

Superficie HTTP de guardias bajo /api/v1/guardias.

- **Prefijo:** `/api/v1/guardias`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/guardias` | `guardias:ver` |
| GET | `/guardias/:id` | `guardias:ver` |
| POST | `/guardias` | `guardias:crear` |
| GET | `/guardias/:id/asignaciones` | `guardias:ver` |
| POST | `/guardias/:id/asignaciones` | `guardias:asignar` |
| DELETE | `/guardias/:id/asignaciones/:asignacionId` | `guardias:editar` |
| POST | `/guardias/:id/asignaciones/:asignacionId/horario` | `guardias:editar` |
| POST | `/guardias/:id/asignaciones/:asignacionId/presencia` | `guardias:editar` |
| GET | `/guardias/:id/cumplimiento/:bomberoId` | `guardias:ver` |

## Archivos

- `backend/src/modules/guardias/guardias.controller.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `exposes` → [[service--guardias-guardias|GuardiasService]]

## Referenciado por

- [[workflow--guardia-y-pernocte|Operacion de una guardia: grupos, asignaciones, presencia, novedades y pernoctes]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
