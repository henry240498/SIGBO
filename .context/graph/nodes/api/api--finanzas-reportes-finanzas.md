---
id: api--finanzas-reportes-finanzas
tipo: API
nombre: ReportesFinanzasController
nivel: L2
dominio: finanzas
resumen: Superficie HTTP de reportes finanzas bajo /api/v1/finanzas/reportes.
prefijo: /api/v1/finanzas/reportes
capa: backend
permisos: [finanzas:reportes]
archivos:
  - backend/src/modules/finanzas/reportes-finanzas.controller.ts
edges:
  - [belongs_to, domain--finanzas]
  - [exposes, service--finanzas-reportes-finanzas]
  - [exposes, service--finanzas-movimientos-financieros]
  - [exposes, service--finanzas-presupuestos]
terminos: [reportes, finanzas]
---

# ReportesFinanzasController

Superficie HTTP de reportes finanzas bajo /api/v1/finanzas/reportes.

- **Prefijo:** `/api/v1/finanzas/reportes`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/finanzas/reportes/movimientos/:id/comprobante.pdf` | `finanzas:reportes` |

## Archivos

- `backend/src/modules/finanzas/reportes-finanzas.controller.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `exposes` → [[service--finanzas-reportes-finanzas|ReportesFinanzasService]]
- `exposes` → [[service--finanzas-movimientos-financieros|MovimientosFinancierosService]]
- `exposes` → [[service--finanzas-presupuestos|PresupuestosService]]

## Referenciado por

- [[component--front-finanzas|finanzas]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
