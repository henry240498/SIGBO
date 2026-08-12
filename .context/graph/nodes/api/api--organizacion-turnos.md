---
id: api--organizacion-turnos
tipo: API
nombre: TurnosController
nivel: L2
dominio: organizacion
resumen: Superficie HTTP de turnos bajo /api/v1/organizacion/turnos.
prefijo: /api/v1/organizacion/turnos
capa: backend
permisos: [organizacion:turnos_ver, organizacion:turnos_crear, organizacion:turnos_editar, organizacion:turnos_eliminar]
archivos:
  - backend/src/modules/organizacion/turnos.controller.ts
edges:
  - [belongs_to, domain--organizacion]
  - [exposes, service--organizacion-turnos]
terminos: [turnos, organizacion, ver, crear, editar, eliminar]
---

# TurnosController

Superficie HTTP de turnos bajo /api/v1/organizacion/turnos.

- **Prefijo:** `/api/v1/organizacion/turnos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/organizacion/turnos` | `organizacion:turnos_ver` |
| GET | `/organizacion/turnos/exportar/excel` | `organizacion:turnos_ver` |
| GET | `/organizacion/turnos/exportar/pdf` | `organizacion:turnos_ver` |
| GET | `/organizacion/turnos/:id` | `organizacion:turnos_ver` |
| POST | `/organizacion/turnos` | `organizacion:turnos_crear` |
| PATCH | `/organizacion/turnos/:id` | `organizacion:turnos_editar` |
| PATCH | `/organizacion/turnos/:id/baja` | `organizacion:turnos_eliminar` |
| PATCH | `/organizacion/turnos/:id/reactivar` | `organizacion:turnos_eliminar` |

## Archivos

- `backend/src/modules/organizacion/turnos.controller.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `exposes` → [[service--organizacion-turnos|TurnosService]]

## Referenciado por

- [[screen--dashboard-organizacion-turnos|/dashboard/organizacion/turnos]] `calls` →
- [[screen--dashboard-organizacion-turnos|/dashboard/organizacion/turnos]] `calls` →
- [[screen--dashboard-organizacion-turnos|/dashboard/organizacion/turnos]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
