---
id: api--guardias-guardias
tipo: API
nombre: GuardiasController
nivel: L2
dominio: guardias
resumen: Superficie HTTP de guardias bajo /api/v1/guardias.
prefijo: /api/v1/guardias
capa: backend
permisos: [guardias:ver, guardias:crear, guardias:editar, guardias:eliminar, guardias:asignar]
archivos:
  - backend/src/modules/guardias/guardias.controller.ts
edges:
  - [belongs_to, domain--guardias]
  - [exposes, service--guardias-guardias]
  - [exposes, service--guardias-generacion]
terminos: [guardias, ver, crear, editar, eliminar, asignar]
---

# GuardiasController

Superficie HTTP de guardias bajo /api/v1/guardias.

- **Prefijo:** `/api/v1/guardias`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/guardias` | `guardias:ver` |
| POST | `/guardias/generar` | `guardias:crear` |
| GET | `/guardias/`:id(${GUID_PATH}` | `guardias:ver` |
| POST | `/guardias` | `guardias:crear` |
| PATCH | `/guardias/`:id(${GUID_PATH}` | `guardias:editar` |
| POST | `/guardias/`:id(${GUID_PATH}` | `guardias:eliminar` |
| GET | `/guardias/`:id(${GUID_PATH}` | `guardias:ver` |
| POST | `/guardias/`:id(${GUID_PATH}` | `guardias:asignar` |
| DELETE | `/guardias/`:id(${GUID_PATH}` | `guardias:editar` |
| POST | `/guardias/`:id(${GUID_PATH}` | `guardias:editar` |
| GET | `/guardias/`:id(${GUID_PATH}` | `guardias:ver` |

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
- [[workflow--guardia-y-pernocte|Operacion de una guardia: grupos, asignaciones, presencia, novedades y pernoctes]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
