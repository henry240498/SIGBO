---
id: api--operaciones-guardias
tipo: API
nombre: GuardiasController
nivel: L2
dominio: asistencia
resumen: Superficie HTTP de guardias bajo /api/v1/operaciones/guardias.
prefijo: /api/v1/operaciones/guardias
capa: backend
permisos: [asistencia:guardias_ver, asistencia:guardias_crear, asistencia:guardias_editar]
archivos:
  - backend/src/modules/operaciones/guardias.controller.ts
edges:
  - [belongs_to, domain--asistencia]
  - [exposes, service--operaciones-guardias]
terminos: [guardias, operaciones, asistencia, ver, crear, editar]
---

# GuardiasController

Superficie HTTP de guardias bajo /api/v1/operaciones/guardias.

- **Prefijo:** `/api/v1/operaciones/guardias`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/operaciones/guardias` | `asistencia:guardias_ver` |
| GET | `/operaciones/guardias/:id` | `asistencia:guardias_ver` |
| POST | `/operaciones/guardias` | `asistencia:guardias_crear` |
| GET | `/operaciones/guardias/:id/asignaciones` | `asistencia:guardias_ver` |
| POST | `/operaciones/guardias/:id/asignaciones` | `asistencia:guardias_editar` |
| DELETE | `/operaciones/guardias/:id/asignaciones/:asignacionId` | `asistencia:guardias_editar` |

## Archivos

- `backend/src/modules/operaciones/guardias.controller.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `exposes` → [[service--operaciones-guardias|GuardiasService]]

## Referenciado por

- [[screen--dashboard-asistencia-guardias-id|/dashboard/asistencia/guardias/[id]]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
