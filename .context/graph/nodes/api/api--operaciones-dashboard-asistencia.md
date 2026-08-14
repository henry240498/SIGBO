---
id: api--operaciones-dashboard-asistencia
tipo: API
nombre: DashboardAsistenciaController
nivel: L2
dominio: asistencia
resumen: Superficie HTTP de dashboard asistencia bajo /api/v1/operaciones/dashboard.
prefijo: /api/v1/operaciones/dashboard
capa: backend
permisos: [asistencia:asistencia_ver]
archivos:
  - backend/src/modules/operaciones/dashboard-asistencia.controller.ts
edges:
  - [belongs_to, domain--asistencia]
  - [exposes, service--operaciones-dashboard-asistencia]
terminos: [asistencia, operaciones, ver]
---

# DashboardAsistenciaController

Superficie HTTP de dashboard asistencia bajo /api/v1/operaciones/dashboard.

- **Prefijo:** `/api/v1/operaciones/dashboard`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/operaciones/dashboard` | `asistencia:asistencia_ver` |

## Archivos

- `backend/src/modules/operaciones/dashboard-asistencia.controller.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `exposes` → [[service--operaciones-dashboard-asistencia|DashboardAsistenciaService]]

## Referenciado por

- [[component--front-asistencia|asistencia]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
