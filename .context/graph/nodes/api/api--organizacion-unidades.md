---
id: api--organizacion-unidades
tipo: API
nombre: UnidadesController
nivel: L2
dominio: organizacion
resumen: Superficie HTTP de unidades bajo /api/v1/organizacion/unidades.
prefijo: /api/v1/organizacion/unidades
capa: backend
permisos: [organizacion:unidades_ver, organizacion:unidades_crear, organizacion:unidades_editar, organizacion:unidades_eliminar]
archivos:
  - backend/src/modules/organizacion/unidades.controller.ts
edges:
  - [belongs_to, domain--organizacion]
  - [exposes, service--organizacion-unidades]
terminos: [unidades, organizacion, ver, crear, editar, eliminar]
---

# UnidadesController

Superficie HTTP de unidades bajo /api/v1/organizacion/unidades.

- **Prefijo:** `/api/v1/organizacion/unidades`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/organizacion/unidades` | `organizacion:unidades_ver` |
| GET | `/organizacion/unidades/exportar/excel` | `organizacion:unidades_ver` |
| GET | `/organizacion/unidades/exportar/pdf` | `organizacion:unidades_ver` |
| GET | `/organizacion/unidades/:id` | `organizacion:unidades_ver` |
| POST | `/organizacion/unidades` | `organizacion:unidades_crear` |
| PATCH | `/organizacion/unidades/:id` | `organizacion:unidades_editar` |
| PATCH | `/organizacion/unidades/:id/baja` | `organizacion:unidades_eliminar` |
| PATCH | `/organizacion/unidades/:id/reactivar` | `organizacion:unidades_eliminar` |

## Archivos

- `backend/src/modules/organizacion/unidades.controller.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `exposes` → [[service--organizacion-unidades|UnidadesService]]

## Referenciado por

- [[screen--dashboard-organizacion-unidades|/dashboard/organizacion/unidades]] `calls` →
- [[screen--dashboard-organizacion-unidades|/dashboard/organizacion/unidades]] `calls` →
- [[screen--dashboard-organizacion-unidades|/dashboard/organizacion/unidades]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
