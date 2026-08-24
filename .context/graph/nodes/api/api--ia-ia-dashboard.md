---
id: api--ia-ia-dashboard
tipo: API
nombre: IaDashboardController
nivel: L2
dominio: inteligencia
resumen: Superficie HTTP de ia dashboard bajo /api/v1/ia/admin/dashboard.
prefijo: /api/v1/ia/admin/dashboard
capa: backend
permisos: [inteligencia:ver_dashboard, inteligencia:exportar_reportes]
archivos:
  - backend/src/modules/ia/ia-dashboard.controller.ts
edges:
  - [belongs_to, domain--inteligencia]
  - [exposes, service--ia-ia-dashboard]
terminos: [admin, inteligencia, ver, exportar, reportes]
---

# IaDashboardController

Superficie HTTP de ia dashboard bajo /api/v1/ia/admin/dashboard.

- **Prefijo:** `/api/v1/ia/admin/dashboard`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/ia/admin/dashboard` | `inteligencia:ver_dashboard` |
| GET | `/ia/admin/dashboard/uso-por-herramienta` | `inteligencia:exportar_reportes` |

## Archivos

- `backend/src/modules/ia/ia-dashboard.controller.ts`

## Relaciones

- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `exposes` → [[service--ia-ia-dashboard|IaDashboardService]]

## Referenciado por

- [[component--front-ia|ia]] `calls` →
- [[component--front-ia|ia]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
