---
id: api--finanzas-cuotas
tipo: API
nombre: CuotasController
nivel: L2
dominio: finanzas
resumen: Superficie HTTP de cuotas bajo /api/v1/finanzas/cuotas.
prefijo: /api/v1/finanzas/cuotas
capa: backend
permisos: [finanzas:ver, finanzas:crear, finanzas:anular, finanzas:editar]
archivos:
  - backend/src/modules/finanzas/cuotas.controller.ts
edges:
  - [belongs_to, domain--finanzas]
  - [exposes, service--finanzas-cuotas]
terminos: [cuotas, finanzas, ver, crear, anular, editar]
---

# CuotasController

Superficie HTTP de cuotas bajo /api/v1/finanzas/cuotas.

- **Prefijo:** `/api/v1/finanzas/cuotas`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/finanzas/cuotas` | `finanzas:ver` |
| GET | `/finanzas/cuotas/:id` | `finanzas:ver` |
| POST | `/finanzas/cuotas` | `finanzas:crear` |
| POST | `/finanzas/cuotas/:id/pagar` | `finanzas:crear` |
| POST | `/finanzas/cuotas/:id/anular` | `finanzas:anular` |
| POST | `/finanzas/cuotas/:id/exonerar` | `finanzas:editar` |

## Archivos

- `backend/src/modules/finanzas/cuotas.controller.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `exposes` → [[service--finanzas-cuotas|CuotasService]]

## Referenciado por

- [[component--front-finanzas|finanzas]] `calls` →
- [[component--front-finanzas|finanzas]] `calls` →
- [[component--front-finanzas|finanzas]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
