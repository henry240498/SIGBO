---
id: api--finanzas-ejercicios-fiscales
tipo: API
nombre: EjerciciosFiscalesController
nivel: L2
dominio: finanzas
resumen: Superficie HTTP de ejercicios fiscales bajo /api/v1/finanzas/ejercicios-fiscales.
prefijo: /api/v1/finanzas/ejercicios-fiscales
capa: backend
permisos: [finanzas:ver, finanzas:administrar_presupuesto]
archivos:
  - backend/src/modules/finanzas/ejercicios-fiscales.controller.ts
edges:
  - [belongs_to, domain--finanzas]
  - [exposes, service--finanzas-ejercicios-fiscales]
terminos: [ejercicios, fiscales, finanzas, ver, administrar, presupuesto]
---

# EjerciciosFiscalesController

Superficie HTTP de ejercicios fiscales bajo /api/v1/finanzas/ejercicios-fiscales.

- **Prefijo:** `/api/v1/finanzas/ejercicios-fiscales`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/finanzas/ejercicios-fiscales` | `finanzas:ver` |
| GET | `/finanzas/ejercicios-fiscales/:id` | `finanzas:ver` |
| POST | `/finanzas/ejercicios-fiscales` | `finanzas:administrar_presupuesto` |
| PATCH | `/finanzas/ejercicios-fiscales/:id/cerrar` | `finanzas:administrar_presupuesto` |
| PATCH | `/finanzas/ejercicios-fiscales/:id/reabrir` | `finanzas:administrar_presupuesto` |

## Archivos

- `backend/src/modules/finanzas/ejercicios-fiscales.controller.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `exposes` → [[service--finanzas-ejercicios-fiscales|EjerciciosFiscalesService]]

## Referenciado por

- [[component--front-finanzas|finanzas]] `calls` →
- [[component--front-finanzas|finanzas]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
