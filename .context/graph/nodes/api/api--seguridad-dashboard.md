---
id: api--seguridad-dashboard
tipo: API
nombre: DashboardController
nivel: L2
dominio: seguridad
resumen: Superficie HTTP de dashboard bajo /api/v1/seguridad/dashboard.
prefijo: /api/v1/seguridad/dashboard
capa: backend
permisos: [seguridad:ver_usuarios]
archivos:
  - backend/src/modules/seguridad/dashboard.controller.ts
edges:
  - [belongs_to, domain--seguridad]
  - [exposes, service--seguridad-dashboard]
terminos: [seguridad, ver, usuarios]
---

# DashboardController

Superficie HTTP de dashboard bajo /api/v1/seguridad/dashboard.

- **Prefijo:** `/api/v1/seguridad/dashboard`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/seguridad/dashboard` | `seguridad:ver_usuarios` |

## Archivos

- `backend/src/modules/seguridad/dashboard.controller.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `exposes` → [[service--seguridad-dashboard|DashboardService]]

## Referenciado por

- [[screen--dashboard-seguridad|/dashboard/seguridad]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
