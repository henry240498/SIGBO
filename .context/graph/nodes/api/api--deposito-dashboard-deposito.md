---
id: api--deposito-dashboard-deposito
tipo: API
nombre: DashboardDepositoController
nivel: L2
dominio: deposito
resumen: Superficie HTTP de dashboard deposito bajo /api/v1/deposito/dashboard.
prefijo: /api/v1/deposito/dashboard
capa: backend
permisos: [deposito:ver]
archivos:
  - backend/src/modules/deposito/dashboard-deposito.controller.ts
edges:
  - [belongs_to, domain--deposito]
  - [exposes, service--deposito-dashboard-deposito]
terminos: [deposito, ver]
---

# DashboardDepositoController

Superficie HTTP de dashboard deposito bajo /api/v1/deposito/dashboard.

- **Prefijo:** `/api/v1/deposito/dashboard`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/deposito/dashboard` | `deposito:ver` |

## Archivos

- `backend/src/modules/deposito/dashboard-deposito.controller.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `exposes` → [[service--deposito-dashboard-deposito|DashboardDepositoService]]

## Referenciado por

- [[component--front-deposito|deposito]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
