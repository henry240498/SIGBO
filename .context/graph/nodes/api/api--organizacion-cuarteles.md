---
id: api--organizacion-cuarteles
tipo: API
nombre: CuartelsController
nivel: L2
dominio: organizacion
resumen: Superficie HTTP de cuarteles bajo /api/v1/organizacion/cuarteles.
prefijo: /api/v1/organizacion/cuarteles
capa: backend
permisos: [organizacion:cuarteles_ver, organizacion:cuarteles_crear, organizacion:cuarteles_editar, organizacion:cuarteles_eliminar]
archivos:
  - backend/src/modules/organizacion/cuarteles.controller.ts
edges:
  - [belongs_to, domain--organizacion]
  - [exposes, service--organizacion-cuarteles]
terminos: [cuartels, organizacion, cuarteles, ver, crear, editar, eliminar]
---

# CuartelsController

Superficie HTTP de cuarteles bajo /api/v1/organizacion/cuarteles.

- **Prefijo:** `/api/v1/organizacion/cuarteles`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/organizacion/cuarteles` | `organizacion:cuarteles_ver` |
| GET | `/organizacion/cuarteles/exportar/excel` | `organizacion:cuarteles_ver` |
| GET | `/organizacion/cuarteles/exportar/pdf` | `organizacion:cuarteles_ver` |
| GET | `/organizacion/cuarteles/:id` | `organizacion:cuarteles_ver` |
| POST | `/organizacion/cuarteles` | `organizacion:cuarteles_crear` |
| PATCH | `/organizacion/cuarteles/:id` | `organizacion:cuarteles_editar` |
| PATCH | `/organizacion/cuarteles/:id/baja` | `organizacion:cuarteles_eliminar` |
| PATCH | `/organizacion/cuarteles/:id/reactivar` | `organizacion:cuarteles_eliminar` |

## Archivos

- `backend/src/modules/organizacion/cuarteles.controller.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `exposes` → [[service--organizacion-cuarteles|CuartelsService]]

## Referenciado por

- [[screen--dashboard-organizacion-cuarteles|/dashboard/organizacion/cuarteles]] `calls` →
- [[screen--dashboard-organizacion-cuarteles|/dashboard/organizacion/cuarteles]] `calls` →
- [[screen--dashboard-organizacion-cuarteles|/dashboard/organizacion/cuarteles]] `calls` →
- [[screen--dashboard-organizacion-designaciones|/dashboard/organizacion/designaciones]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
