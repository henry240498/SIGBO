---
id: api--finanzas-ordenes-pago
tipo: API
nombre: OrdenesPagoController
nivel: L2
dominio: finanzas
resumen: Superficie HTTP de ordenes pago bajo /api/v1/finanzas/ordenes-pago.
prefijo: /api/v1/finanzas/ordenes-pago
capa: backend
permisos: [finanzas:ver, finanzas:crear, finanzas:autorizar, finanzas:anular]
archivos:
  - backend/src/modules/finanzas/ordenes-pago.controller.ts
edges:
  - [belongs_to, domain--finanzas]
  - [exposes, service--finanzas-ordenes-pago]
terminos: [ordenes, pago, finanzas, ver, crear, autorizar, anular]
---

# OrdenesPagoController

Superficie HTTP de ordenes pago bajo /api/v1/finanzas/ordenes-pago.

- **Prefijo:** `/api/v1/finanzas/ordenes-pago`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/finanzas/ordenes-pago` | `finanzas:ver` |
| GET | `/finanzas/ordenes-pago/:id` | `finanzas:ver` |
| POST | `/finanzas/ordenes-pago` | `finanzas:crear` |
| POST | `/finanzas/ordenes-pago/:id/solicitar` | `finanzas:crear` |
| POST | `/finanzas/ordenes-pago/:id/enviar-autorizacion` | `finanzas:crear` |
| POST | `/finanzas/ordenes-pago/:id/autorizar` | `finanzas:autorizar` |
| POST | `/finanzas/ordenes-pago/:id/rechazar` | `finanzas:autorizar` |
| POST | `/finanzas/ordenes-pago/:id/reabrir` | `finanzas:crear` |
| POST | `/finanzas/ordenes-pago/:id/anular` | `finanzas:anular` |
| POST | `/finanzas/ordenes-pago/:id/pagar` | `finanzas:crear` |

## Archivos

- `backend/src/modules/finanzas/ordenes-pago.controller.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `exposes` → [[service--finanzas-ordenes-pago|OrdenesPagoService]]

## Referenciado por

- [[component--front-finanzas|finanzas]] `calls` →
- [[component--front-finanzas|finanzas]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
