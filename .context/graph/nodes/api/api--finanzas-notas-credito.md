---
id: api--finanzas-notas-credito
tipo: API
nombre: NotasCreditoController
nivel: L2
dominio: finanzas
resumen: Superficie HTTP de notas credito bajo /api/v1/finanzas/notas-credito.
prefijo: /api/v1/finanzas/notas-credito
capa: backend
permisos: [finanzas:facturacion_ver, finanzas:notas_credito_crear]
archivos:
  - backend/src/modules/finanzas/notas-credito.controller.ts
edges:
  - [belongs_to, domain--finanzas]
  - [exposes, service--finanzas-notas-credito]
terminos: [notas, credito, finanzas, facturacion, ver, crear]
---

# NotasCreditoController

Superficie HTTP de notas credito bajo /api/v1/finanzas/notas-credito.

- **Prefijo:** `/api/v1/finanzas/notas-credito`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/finanzas/notas-credito` | `finanzas:facturacion_ver` |
| POST | `/finanzas/notas-credito` | `finanzas:notas_credito_crear` |
| GET | `/finanzas/notas-credito/:id` | `finanzas:facturacion_ver` |

## Archivos

- `backend/src/modules/finanzas/notas-credito.controller.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `exposes` → [[service--finanzas-notas-credito|NotasCreditoService]]

## Referenciado por

- [[component--front-socios-protectores|socios-protectores]] `calls` →
- [[component--front-socios-protectores|socios-protectores]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
