---
id: api--finanzas-cajas
tipo: API
nombre: CajasController
nivel: L2
dominio: finanzas
resumen: Superficie HTTP de cajas bajo /api/v1/finanzas/cajas.
prefijo: /api/v1/finanzas/cajas
capa: backend
permisos: [finanzas:ver, finanzas:administrar_cajas, finanzas:cerrar_caja]
archivos:
  - backend/src/modules/finanzas/cajas.controller.ts
edges:
  - [belongs_to, domain--finanzas]
  - [exposes, service--finanzas-cajas]
terminos: [cajas, finanzas, ver, administrar, cerrar, caja]
---

# CajasController

Superficie HTTP de cajas bajo /api/v1/finanzas/cajas.

- **Prefijo:** `/api/v1/finanzas/cajas`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/finanzas/cajas` | `finanzas:ver` |
| GET | `/finanzas/cajas/:id` | `finanzas:ver` |
| GET | `/finanzas/cajas/:id/turnos` | `finanzas:ver` |
| GET | `/finanzas/cajas/:id/turno-abierto` | `finanzas:ver` |
| POST | `/finanzas/cajas` | `finanzas:administrar_cajas` |
| PATCH | `/finanzas/cajas/:id` | `finanzas:administrar_cajas` |
| POST | `/finanzas/cajas/:id/abrir` | `finanzas:cerrar_caja` |
| POST | `/finanzas/cajas/:id/cerrar` | `finanzas:cerrar_caja` |

## Archivos

- `backend/src/modules/finanzas/cajas.controller.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `exposes` → [[service--finanzas-cajas|CajasService]]

## Referenciado por

- [[component--front-finanzas|finanzas]] `calls` →
- [[component--front-finanzas|finanzas]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
