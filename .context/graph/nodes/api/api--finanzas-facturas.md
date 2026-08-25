---
id: api--finanzas-facturas
tipo: API
nombre: FacturasController
nivel: L2
dominio: finanzas
resumen: Superficie HTTP de facturas bajo /api/v1/finanzas/facturas.
prefijo: /api/v1/finanzas/facturas
capa: backend
permisos: [finanzas:facturacion_ver, finanzas:facturacion_crear, finanzas:facturacion_anular]
archivos:
  - backend/src/modules/finanzas/facturas.controller.ts
edges:
  - [belongs_to, domain--finanzas]
  - [exposes, service--finanzas-facturas]
terminos: [facturas, finanzas, facturacion, ver, crear, anular]
---

# FacturasController

Superficie HTTP de facturas bajo /api/v1/finanzas/facturas.

- **Prefijo:** `/api/v1/finanzas/facturas`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/finanzas/facturas` | `finanzas:facturacion_ver` |
| POST | `/finanzas/facturas` | `finanzas:facturacion_crear` |
| GET | `/finanzas/facturas/:id` | `finanzas:facturacion_ver` |
| POST | `/finanzas/facturas/:id/anular` | `finanzas:facturacion_anular` |

## Archivos

- `backend/src/modules/finanzas/facturas.controller.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `exposes` → [[service--finanzas-facturas|FacturasService]]

## Referenciado por

- [[component--front-socios-protectores|socios-protectores]] `calls` →
- [[component--front-socios-protectores|socios-protectores]] `calls` →
- [[component--front-socios-protectores|socios-protectores]] `calls` →
- [[component--front-socios-protectores|socios-protectores]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
