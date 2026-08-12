---
id: api--organizacion-cargos
tipo: API
nombre: CargosController
nivel: L2
dominio: organizacion
resumen: Superficie HTTP de cargos bajo /api/v1/organizacion/cargos.
prefijo: /api/v1/organizacion/cargos
capa: backend
permisos: [organizacion:cargos_ver, organizacion:cargos_crear, organizacion:cargos_editar, organizacion:cargos_eliminar]
archivos:
  - backend/src/modules/organizacion/cargos.controller.ts
edges:
  - [belongs_to, domain--organizacion]
  - [exposes, service--organizacion-cargos]
terminos: [cargos, organizacion, ver, crear, editar, eliminar]
---

# CargosController

Superficie HTTP de cargos bajo /api/v1/organizacion/cargos.

- **Prefijo:** `/api/v1/organizacion/cargos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/organizacion/cargos` | `organizacion:cargos_ver` |
| GET | `/organizacion/cargos/exportar/excel` | `organizacion:cargos_ver` |
| GET | `/organizacion/cargos/exportar/pdf` | `organizacion:cargos_ver` |
| GET | `/organizacion/cargos/:id` | `organizacion:cargos_ver` |
| POST | `/organizacion/cargos` | `organizacion:cargos_crear` |
| PATCH | `/organizacion/cargos/:id` | `organizacion:cargos_editar` |
| PATCH | `/organizacion/cargos/:id/baja` | `organizacion:cargos_eliminar` |
| PATCH | `/organizacion/cargos/:id/reactivar` | `organizacion:cargos_eliminar` |

## Archivos

- `backend/src/modules/organizacion/cargos.controller.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `exposes` → [[service--organizacion-cargos|CargosService]]

## Referenciado por

- [[screen--dashboard-organizacion-cargos|/dashboard/organizacion/cargos]] `calls` →
- [[screen--dashboard-organizacion-cargos|/dashboard/organizacion/cargos]] `calls` →
- [[screen--dashboard-organizacion-cargos|/dashboard/organizacion/cargos]] `calls` →
- [[screen--dashboard-organizacion-designaciones|/dashboard/organizacion/designaciones]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
