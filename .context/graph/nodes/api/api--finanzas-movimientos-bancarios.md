---
id: api--finanzas-movimientos-bancarios
tipo: API
nombre: MovimientosBancariosController
nivel: L2
dominio: finanzas
resumen: Superficie HTTP de movimientos bancarios bajo /api/v1/finanzas/movimientos-bancarios.
prefijo: /api/v1/finanzas/movimientos-bancarios
capa: backend
permisos: [finanzas:ver, finanzas:crear, finanzas:conciliar]
archivos:
  - backend/src/modules/finanzas/movimientos-bancarios.controller.ts
edges:
  - [belongs_to, domain--finanzas]
  - [exposes, service--finanzas-movimientos-bancarios]
terminos: [movimientos, bancarios, finanzas, ver, crear, conciliar]
---

# MovimientosBancariosController

Superficie HTTP de movimientos bancarios bajo /api/v1/finanzas/movimientos-bancarios.

- **Prefijo:** `/api/v1/finanzas/movimientos-bancarios`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/finanzas/movimientos-bancarios` | `finanzas:ver` |
| GET | `/finanzas/movimientos-bancarios/:id` | `finanzas:ver` |
| POST | `/finanzas/movimientos-bancarios` | `finanzas:crear` |
| POST | `/finanzas/movimientos-bancarios/:id/conciliar` | `finanzas:conciliar` |

## Archivos

- `backend/src/modules/finanzas/movimientos-bancarios.controller.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `exposes` → [[service--finanzas-movimientos-bancarios|MovimientosBancariosService]]

## Referenciado por

- [[component--front-finanzas|finanzas]] `calls` →
- [[component--front-finanzas|finanzas]] `calls` →
- [[component--front-finanzas|finanzas]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
