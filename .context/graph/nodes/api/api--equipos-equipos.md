---
id: api--equipos-equipos
tipo: API
nombre: EquiposController
nivel: L2
dominio: equipos
resumen: Superficie HTTP de equipos bajo /api/v1/equipos/equipos.
prefijo: /api/v1/equipos/equipos
capa: backend
permisos: [equipos:ver, equipos:crear, equipos:editar, equipos:eliminar, equipos:mantenimiento]
archivos:
  - backend/src/modules/equipos/equipos.controller.ts
edges:
  - [belongs_to, domain--equipos]
  - [exposes, service--equipos-equipos]
terminos: [equipos, ver, crear, editar, eliminar, mantenimiento]
---

# EquiposController

Superficie HTTP de equipos bajo /api/v1/equipos/equipos.

- **Prefijo:** `/api/v1/equipos/equipos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/equipos/equipos` | `equipos:ver` |
| GET | `/equipos/equipos/:id` | `equipos:ver` |
| POST | `/equipos/equipos` | `equipos:crear` |
| PATCH | `/equipos/equipos/:id` | `equipos:editar` |
| DELETE | `/equipos/equipos/:id` | `equipos:eliminar` |
| GET | `/equipos/equipos/:id/historial` | `equipos:ver` |
| GET | `/equipos/equipos/:id/mantenimientos` | `equipos:mantenimiento` |
| POST | `/equipos/equipos/:id/mantenimientos` | `equipos:mantenimiento` |
| PATCH | `/equipos/equipos/:id/asignar-movil` | `equipos:editar` |

## Archivos

- `backend/src/modules/equipos/equipos.controller.ts`

## Relaciones

- `belongs_to` → [[domain--equipos|Equipos]]
- `exposes` → [[service--equipos-equipos|EquiposService]]

## Referenciado por

- [[screen--dashboard-personal-id|/dashboard/personal/[id]]] `calls` →
- [[component--front-equipos|equipos]] `calls` →
- [[component--front-equipos|equipos]] `calls` →
- [[component--front-equipos|equipos]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
