---
id: api--organizacion-rangos
tipo: API
nombre: RangosController
nivel: L2
dominio: organizacion
resumen: Superficie HTTP de rangos bajo /api/v1/organizacion/rangos.
prefijo: /api/v1/organizacion/rangos
capa: backend
permisos: [organizacion:rangos_ver, organizacion:rangos_crear, organizacion:rangos_editar, organizacion:rangos_eliminar]
archivos:
  - backend/src/modules/organizacion/rangos.controller.ts
edges:
  - [belongs_to, domain--organizacion]
  - [exposes, service--organizacion-rangos]
terminos: [rangos, organizacion, ver, crear, editar, eliminar]
---

# RangosController

Superficie HTTP de rangos bajo /api/v1/organizacion/rangos.

- **Prefijo:** `/api/v1/organizacion/rangos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/organizacion/rangos` | `organizacion:rangos_ver` |
| GET | `/organizacion/rangos/exportar/excel` | `organizacion:rangos_ver` |
| GET | `/organizacion/rangos/exportar/pdf` | `organizacion:rangos_ver` |
| GET | `/organizacion/rangos/:id` | `organizacion:rangos_ver` |
| POST | `/organizacion/rangos` | `organizacion:rangos_crear` |
| PATCH | `/organizacion/rangos/:id` | `organizacion:rangos_editar` |
| PATCH | `/organizacion/rangos/:id/baja` | `organizacion:rangos_eliminar` |
| PATCH | `/organizacion/rangos/:id/reactivar` | `organizacion:rangos_eliminar` |

## Archivos

- `backend/src/modules/organizacion/rangos.controller.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `exposes` → [[service--organizacion-rangos|RangosService]]

## Referenciado por

- [[screen--dashboard-organizacion-ascensos|/dashboard/organizacion/ascensos]] `calls` →
- [[screen--dashboard-organizacion-rangos|/dashboard/organizacion/rangos]] `calls` →
- [[screen--dashboard-organizacion-rangos|/dashboard/organizacion/rangos]] `calls` →
- [[screen--dashboard-organizacion-rangos|/dashboard/organizacion/rangos]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
