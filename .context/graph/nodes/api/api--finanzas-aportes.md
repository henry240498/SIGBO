---
id: api--finanzas-aportes
tipo: API
nombre: AportesController
nivel: L2
dominio: finanzas
resumen: Superficie HTTP de aportes bajo /api/v1/finanzas/aportes.
prefijo: /api/v1/finanzas/aportes
capa: backend
permisos: [finanzas:socios_ver, finanzas:aportes_registrar, finanzas:aportes_editar]
archivos:
  - backend/src/modules/finanzas/aportes.controller.ts
edges:
  - [belongs_to, domain--finanzas]
  - [exposes, service--finanzas-aportes]
terminos: [aportes, finanzas, socios, ver, registrar, editar]
---

# AportesController

Superficie HTTP de aportes bajo /api/v1/finanzas/aportes.

- **Prefijo:** `/api/v1/finanzas/aportes`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/finanzas/aportes` | `finanzas:socios_ver` |
| POST | `/finanzas/aportes` | `finanzas:aportes_registrar` |
| POST | `/finanzas/aportes/comprobante` | `finanzas:aportes_registrar` |
| GET | `/finanzas/aportes/:id` | `finanzas:socios_ver` |
| POST | `/finanzas/aportes/:id/anular` | `finanzas:aportes_editar` |

## Archivos

- `backend/src/modules/finanzas/aportes.controller.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `exposes` → [[service--finanzas-aportes|AportesService]]

## Referenciado por

- [[component--front-socios-protectores|socios-protectores]] `calls` →
- [[component--front-socios-protectores|socios-protectores]] `calls` →
- [[component--front-socios-protectores|socios-protectores]] `calls` →
- [[component--front-socios-protectores|socios-protectores]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
