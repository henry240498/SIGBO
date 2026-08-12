---
id: api--organizacion-designaciones
tipo: API
nombre: DesignacionesController
nivel: L2
dominio: organizacion
resumen: Superficie HTTP de designaciones bajo /api/v1/organizacion/designaciones.
prefijo: /api/v1/organizacion/designaciones
capa: backend
permisos: [organizacion:designaciones_ver, organizacion:designaciones_crear, organizacion:designaciones_editar, organizacion:designaciones_finalizar, organizacion:designaciones_eliminar]
archivos:
  - backend/src/modules/organizacion/designaciones.controller.ts
edges:
  - [belongs_to, domain--organizacion]
  - [exposes, service--organizacion-designaciones]
terminos: [designaciones, organizacion, ver, crear, editar, finalizar, eliminar]
---

# DesignacionesController

Superficie HTTP de designaciones bajo /api/v1/organizacion/designaciones.

- **Prefijo:** `/api/v1/organizacion/designaciones`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/organizacion/designaciones` | `organizacion:designaciones_ver` |
| GET | `/organizacion/designaciones/exportar/excel` | `organizacion:designaciones_ver` |
| GET | `/organizacion/designaciones/exportar/pdf` | `organizacion:designaciones_ver` |
| GET | `/organizacion/designaciones/:id` | `organizacion:designaciones_ver` |
| POST | `/organizacion/designaciones` | `organizacion:designaciones_crear` |
| PATCH | `/organizacion/designaciones/:id` | `organizacion:designaciones_editar` |
| PATCH | `/organizacion/designaciones/:id/finalizar` | `organizacion:designaciones_finalizar` |
| PATCH | `/organizacion/designaciones/:id/baja` | `organizacion:designaciones_eliminar` |
| PATCH | `/organizacion/designaciones/:id/reactivar` | `organizacion:designaciones_eliminar` |

## Archivos

- `backend/src/modules/organizacion/designaciones.controller.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `exposes` → [[service--organizacion-designaciones|DesignacionesService]]

## Referenciado por

- [[screen--dashboard-organizacion-designaciones|/dashboard/organizacion/designaciones]] `calls` →
- [[screen--dashboard-organizacion-designaciones|/dashboard/organizacion/designaciones]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
