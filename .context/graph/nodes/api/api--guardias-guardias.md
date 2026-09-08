---
id: api--guardias-guardias
tipo: API
nombre: GuardiasController
nivel: L2
dominio: guardias
resumen: "Los controladores con subrutas literales se registran antes de éste en GuardiasModule. Así Express 5 no necesita expresiones regulares embebidas en el path; ParseUUIDPipe mantiene la validación del identificador."
prefijo: /api/v1/guardias
capa: backend
permisos: [guardias:ver, guardias:crear, guardias:editar, guardias:eliminar, guardias:asignar, guardias:reemplazar]
archivos:
  - backend/src/modules/guardias/guardias.controller.ts
edges:
  - [belongs_to, domain--guardias]
  - [exposes, service--guardias-guardias]
  - [exposes, service--guardias-generacion]
terminos: [guardias, ver, crear, editar, eliminar, asignar, reemplazar]
---

# GuardiasController

Los controladores con subrutas literales se registran antes de éste en GuardiasModule. Así Express 5 no necesita expresiones regulares embebidas en el path; ParseUUIDPipe mantiene la validación del identificador.

- **Prefijo:** `/api/v1/guardias`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/guardias` | `guardias:ver` |
| POST | `/guardias/generar` | `guardias:crear` |
| POST | `/guardias/planificacion/manual` | `guardias:editar` |
| GET | `/guardias/:id` | `guardias:ver` |
| POST | `/guardias` | `guardias:crear` |
| PATCH | `/guardias/:id` | `guardias:editar` |
| POST | `/guardias/:id/anular` | `guardias:eliminar` |
| GET | `/guardias/:id/asignaciones` | `guardias:ver` |
| POST | `/guardias/:id/asignaciones` | `guardias:asignar` |
| POST | `/guardias/:id/asignaciones/:asignacionId/reemplazar` | `guardias:reemplazar` |
| DELETE | `/guardias/:id/asignaciones/:asignacionId` | `guardias:editar` |
| POST | `/guardias/:id/asignaciones/:asignacionId/horario` | `guardias:editar` |
| POST | `/guardias/:id/asignaciones/:asignacionId/presencia` | `guardias:editar` |
| GET | `/guardias/:id/cumplimiento/:bomberoId` | `guardias:ver` |

## Archivos

- `backend/src/modules/guardias/guardias.controller.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `exposes` → [[service--guardias-guardias|GuardiasService]]
- `exposes` → [[service--guardias-generacion|GeneracionService]]

## Referenciado por

- [[component--front-guardias|guardias]] `calls` →
- [[component--front-guardias|guardias]] `calls` →
- [[component--front-guardias|guardias]] `calls` →
- [[component--front-guardias|guardias]] `calls` →
- [[component--front-guardias|guardias]] `calls` →
- [[component--front-guardias|guardias]] `calls` →
- [[workflow--guardia-y-pernocte|Operacion de una guardia: grupos, asignaciones, presencia, novedades y pernoctes]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
