---
id: api--finanzas-dashboard-finanzas
tipo: API
nombre: DashboardFinanzasController
nivel: L2
dominio: finanzas
resumen: Superficie HTTP de dashboard finanzas bajo /api/v1/finanzas/dashboard.
prefijo: /api/v1/finanzas/dashboard
capa: backend
permisos: [finanzas:ver]
archivos:
  - backend/src/modules/finanzas/dashboard-finanzas.controller.ts
edges:
  - [belongs_to, domain--finanzas]
  - [exposes, service--finanzas-dashboard-finanzas]
terminos: [finanzas, ver]
---

# DashboardFinanzasController

Superficie HTTP de dashboard finanzas bajo /api/v1/finanzas/dashboard.

- **Prefijo:** `/api/v1/finanzas/dashboard`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/finanzas/dashboard` | `finanzas:ver` |

## Archivos

- `backend/src/modules/finanzas/dashboard-finanzas.controller.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `exposes` → [[service--finanzas-dashboard-finanzas|DashboardFinanzasService]]

## Referenciado por

- [[component--front-finanzas|finanzas]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
