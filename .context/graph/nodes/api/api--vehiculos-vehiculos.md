---
id: api--vehiculos-vehiculos
tipo: API
nombre: VehiculosController
nivel: L2
dominio: vehiculos
resumen: Superficie HTTP de vehiculos bajo /api/v1/vehiculos/vehiculos.
prefijo: /api/v1/vehiculos/vehiculos
capa: backend
permisos: [vehiculos:ver, vehiculos:crear, vehiculos:editar, vehiculos:eliminar, vehiculos:mantenimiento, vehiculos:combustible]
archivos:
  - backend/src/modules/vehiculos/vehiculos.controller.ts
edges:
  - [belongs_to, domain--vehiculos]
  - [exposes, service--vehiculos-vehiculos]
terminos: [vehiculos, ver, crear, editar, eliminar, mantenimiento, combustible]
---

# VehiculosController

Superficie HTTP de vehiculos bajo /api/v1/vehiculos/vehiculos.

- **Prefijo:** `/api/v1/vehiculos/vehiculos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/vehiculos/vehiculos` | `vehiculos:ver` |
| GET | `/vehiculos/vehiculos/:id` | `vehiculos:ver` |
| POST | `/vehiculos/vehiculos` | `vehiculos:crear` |
| PATCH | `/vehiculos/vehiculos/:id` | `vehiculos:editar` |
| PATCH | `/vehiculos/vehiculos/:id/baja` | `vehiculos:eliminar` |
| GET | `/vehiculos/vehiculos/:id/historial` | `vehiculos:ver` |
| GET | `/vehiculos/vehiculos/:id/mantenimientos` | `vehiculos:mantenimiento` |
| POST | `/vehiculos/vehiculos/:id/mantenimientos` | `vehiculos:mantenimiento` |
| GET | `/vehiculos/vehiculos/:id/combustible` | `vehiculos:combustible` |
| POST | `/vehiculos/vehiculos/:id/combustible` | `vehiculos:combustible` |

## Archivos

- `backend/src/modules/vehiculos/vehiculos.controller.ts`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `exposes` → [[service--vehiculos-vehiculos|VehiculosService]]

## Referenciado por

- [[screen--dashboard-personal-id|/dashboard/personal/[id]]] `calls` →
- [[component--front-vehiculos|vehiculos]] `calls` →
- [[component--front-vehiculos|vehiculos]] `calls` →
- [[component--front-vehiculos|vehiculos]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
