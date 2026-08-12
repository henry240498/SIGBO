---
id: api--organizacion-especialidades
tipo: API
nombre: EspecialidadesController
nivel: L2
dominio: organizacion
resumen: Superficie HTTP de especialidades bajo /api/v1/organizacion/especialidades.
prefijo: /api/v1/organizacion/especialidades
capa: backend
permisos: [organizacion:especialidades_ver, organizacion:especialidades_crear, organizacion:especialidades_editar, organizacion:especialidades_eliminar]
archivos:
  - backend/src/modules/organizacion/especialidades.controller.ts
edges:
  - [belongs_to, domain--organizacion]
  - [exposes, service--organizacion-especialidades]
terminos: [especialidades, organizacion, ver, crear, editar, eliminar]
---

# EspecialidadesController

Superficie HTTP de especialidades bajo /api/v1/organizacion/especialidades.

- **Prefijo:** `/api/v1/organizacion/especialidades`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/organizacion/especialidades` | `organizacion:especialidades_ver` |
| GET | `/organizacion/especialidades/exportar/excel` | `organizacion:especialidades_ver` |
| GET | `/organizacion/especialidades/exportar/pdf` | `organizacion:especialidades_ver` |
| GET | `/organizacion/especialidades/:id` | `organizacion:especialidades_ver` |
| POST | `/organizacion/especialidades` | `organizacion:especialidades_crear` |
| PATCH | `/organizacion/especialidades/:id` | `organizacion:especialidades_editar` |
| PATCH | `/organizacion/especialidades/:id/baja` | `organizacion:especialidades_eliminar` |
| PATCH | `/organizacion/especialidades/:id/reactivar` | `organizacion:especialidades_eliminar` |

## Archivos

- `backend/src/modules/organizacion/especialidades.controller.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `exposes` → [[service--organizacion-especialidades|EspecialidadesService]]

## Referenciado por

- [[screen--dashboard-organizacion-especialidades|/dashboard/organizacion/especialidades]] `calls` →
- [[screen--dashboard-organizacion-especialidades|/dashboard/organizacion/especialidades]] `calls` →
- [[screen--dashboard-organizacion-especialidades|/dashboard/organizacion/especialidades]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
