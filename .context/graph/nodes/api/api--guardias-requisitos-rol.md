---
id: api--guardias-requisitos-rol
tipo: API
nombre: RequisitosRolController
nivel: L2
dominio: guardias
resumen: Superficie HTTP de requisitos rol bajo /api/v1/guardias/requisitos-rol.
prefijo: /api/v1/guardias/requisitos-rol
capa: backend
permisos: [guardias:requisitos]
archivos:
  - backend/src/modules/guardias/requisitos-rol.controller.ts
edges:
  - [belongs_to, domain--guardias]
  - [exposes, service--guardias-requisitos-rol]
terminos: [requisitos, rol, guardias]
---

# RequisitosRolController

Superficie HTTP de requisitos rol bajo /api/v1/guardias/requisitos-rol.

- **Prefijo:** `/api/v1/guardias/requisitos-rol`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/guardias/requisitos-rol` | `guardias:requisitos` |
| POST | `/guardias/requisitos-rol` | `guardias:requisitos` |
| PATCH | `/guardias/requisitos-rol/:id/activo` | `guardias:requisitos` |
| DELETE | `/guardias/requisitos-rol/:id` | `guardias:requisitos` |

## Archivos

- `backend/src/modules/guardias/requisitos-rol.controller.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `exposes` → [[service--guardias-requisitos-rol|RequisitosRolService]]

## Referenciado por

- [[component--front-guardias|guardias]] `calls` →
- [[component--front-guardias|guardias]] `calls` →
- [[component--front-guardias|guardias]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
