---
id: api--finanzas-movimientos-financieros
tipo: API
nombre: MovimientosFinancierosController
nivel: L2
dominio: finanzas
resumen: Superficie HTTP de movimientos financieros bajo /api/v1/finanzas/movimientos.
prefijo: /api/v1/finanzas/movimientos
capa: backend
permisos: [finanzas:ver, finanzas:crear, finanzas:anular]
archivos:
  - backend/src/modules/finanzas/movimientos-financieros.controller.ts
edges:
  - [belongs_to, domain--finanzas]
  - [exposes, service--finanzas-movimientos-financieros]
terminos: [movimientos, financieros, finanzas, ver, crear, anular]
---

# MovimientosFinancierosController

Superficie HTTP de movimientos financieros bajo /api/v1/finanzas/movimientos.

- **Prefijo:** `/api/v1/finanzas/movimientos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/finanzas/movimientos/:id` | `finanzas:ver` |
| GET | `/finanzas/movimientos/:id/documento` | `finanzas:ver` |
| POST | `/finanzas/movimientos` | `finanzas:crear` |
| POST | `/finanzas/movimientos/:id/anular` | `finanzas:anular` |

## Archivos

- `backend/src/modules/finanzas/movimientos-financieros.controller.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `exposes` → [[service--finanzas-movimientos-financieros|MovimientosFinancierosService]]

## Referenciado por

- [[component--front-finanzas|finanzas]] `calls` →
- [[component--front-finanzas|finanzas]] `calls` →
- [[component--front-finanzas|finanzas]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
