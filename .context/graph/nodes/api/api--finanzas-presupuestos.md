---
id: api--finanzas-presupuestos
tipo: API
nombre: PresupuestosController
nivel: L2
dominio: finanzas
resumen: Superficie HTTP de presupuestos bajo /api/v1/finanzas/presupuestos.
prefijo: /api/v1/finanzas/presupuestos
capa: backend
permisos: [finanzas:ver, finanzas:administrar_presupuesto]
archivos:
  - backend/src/modules/finanzas/presupuestos.controller.ts
edges:
  - [belongs_to, domain--finanzas]
  - [exposes, service--finanzas-presupuestos]
terminos: [presupuestos, finanzas, ver, administrar, presupuesto]
---

# PresupuestosController

Superficie HTTP de presupuestos bajo /api/v1/finanzas/presupuestos.

- **Prefijo:** `/api/v1/finanzas/presupuestos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/finanzas/presupuestos` | `finanzas:ver` |
| GET | `/finanzas/presupuestos/:id` | `finanzas:ver` |
| POST | `/finanzas/presupuestos` | `finanzas:administrar_presupuesto` |
| PATCH | `/finanzas/presupuestos/:id` | `finanzas:administrar_presupuesto` |

## Archivos

- `backend/src/modules/finanzas/presupuestos.controller.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `exposes` → [[service--finanzas-presupuestos|PresupuestosService]]

## Referenciado por

- [[component--front-finanzas|finanzas]] `calls` →
- [[component--front-finanzas|finanzas]] `calls` →
- [[component--front-finanzas|finanzas]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
