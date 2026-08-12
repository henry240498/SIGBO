---
id: api--organizacion-companias
tipo: API
nombre: CompaniasController
nivel: L2
dominio: organizacion
resumen: Superficie HTTP de companias bajo /api/v1/organizacion/companias.
prefijo: /api/v1/organizacion/companias
capa: backend
permisos: [organizacion:companias_ver, organizacion:companias_crear, organizacion:companias_editar, organizacion:companias_eliminar]
archivos:
  - backend/src/modules/organizacion/companias.controller.ts
edges:
  - [belongs_to, domain--organizacion]
  - [exposes, service--organizacion-companias]
terminos: [companias, organizacion, ver, crear, editar, eliminar]
---

# CompaniasController

Superficie HTTP de companias bajo /api/v1/organizacion/companias.

- **Prefijo:** `/api/v1/organizacion/companias`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/organizacion/companias` | `organizacion:companias_ver` |
| GET | `/organizacion/companias/exportar/excel` | `organizacion:companias_ver` |
| GET | `/organizacion/companias/exportar/pdf` | `organizacion:companias_ver` |
| GET | `/organizacion/companias/:id` | `organizacion:companias_ver` |
| POST | `/organizacion/companias` | `organizacion:companias_crear` |
| PATCH | `/organizacion/companias/:id` | `organizacion:companias_editar` |
| PATCH | `/organizacion/companias/:id/baja` | `organizacion:companias_eliminar` |
| PATCH | `/organizacion/companias/:id/reactivar` | `organizacion:companias_eliminar` |

## Archivos

- `backend/src/modules/organizacion/companias.controller.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `exposes` → [[service--organizacion-companias|CompaniasService]]

## Referenciado por

- [[screen--dashboard-organizacion-companias|/dashboard/organizacion/companias]] `calls` →
- [[screen--dashboard-organizacion-companias|/dashboard/organizacion/companias]] `calls` →
- [[screen--dashboard-organizacion-companias|/dashboard/organizacion/companias]] `calls` →
- [[screen--dashboard-organizacion-cuarteles|/dashboard/organizacion/cuarteles]] `calls` →
- [[screen--dashboard-organizacion-designaciones|/dashboard/organizacion/designaciones]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
