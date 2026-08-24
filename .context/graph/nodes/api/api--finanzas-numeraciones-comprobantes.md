---
id: api--finanzas-numeraciones-comprobantes
tipo: API
nombre: NumeracionesComprobantesController
nivel: L2
dominio: finanzas
resumen: Superficie HTTP de numeraciones comprobantes bajo /api/v1/finanzas/numeraciones-comprobantes.
prefijo: /api/v1/finanzas/numeraciones-comprobantes
capa: backend
permisos: [finanzas:facturacion_ver, finanzas:facturacion_crear]
archivos:
  - backend/src/modules/finanzas/numeraciones-comprobantes.controller.ts
edges:
  - [belongs_to, domain--finanzas]
  - [exposes, service--finanzas-numeraciones-comprobantes]
terminos: [numeraciones, comprobantes, finanzas, facturacion, ver, crear]
---

# NumeracionesComprobantesController

Superficie HTTP de numeraciones comprobantes bajo /api/v1/finanzas/numeraciones-comprobantes.

- **Prefijo:** `/api/v1/finanzas/numeraciones-comprobantes`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/finanzas/numeraciones-comprobantes` | `finanzas:facturacion_ver` |
| POST | `/finanzas/numeraciones-comprobantes` | `finanzas:facturacion_crear` |
| GET | `/finanzas/numeraciones-comprobantes/:id` | `finanzas:facturacion_ver` |

## Archivos

- `backend/src/modules/finanzas/numeraciones-comprobantes.controller.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `exposes` → [[service--finanzas-numeraciones-comprobantes|NumeracionesComprobantesService]]

## Referenciado por

- [[component--front-socios-protectores|socios-protectores]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
