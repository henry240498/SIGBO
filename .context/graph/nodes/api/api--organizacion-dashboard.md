---
id: api--organizacion-dashboard
tipo: API
nombre: DashboardController
nivel: L2
dominio: organizacion
resumen: Superficie HTTP de dashboard bajo /api/v1/organizacion/dashboard.
prefijo: /api/v1/organizacion/dashboard
capa: backend
permisos: [organizacion:ver_dashboard]
archivos:
  - backend/src/modules/organizacion/dashboard.controller.ts
edges:
  - [belongs_to, domain--organizacion]
  - [exposes, service--seguridad-dashboard]
terminos: [organizacion, ver]
---

# DashboardController

Superficie HTTP de dashboard bajo /api/v1/organizacion/dashboard.

- **Prefijo:** `/api/v1/organizacion/dashboard`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/organizacion/dashboard` | `organizacion:ver_dashboard` |

## Archivos

- `backend/src/modules/organizacion/dashboard.controller.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `exposes` → [[service--seguridad-dashboard|DashboardService]]

## Referenciado por

- [[screen--dashboard-organizacion|/dashboard/organizacion]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
