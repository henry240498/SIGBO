---
id: api--reservas-reservas
tipo: API
nombre: ReservasController
nivel: L2
dominio: reservas
resumen: Reservas de instalaciones del cuartel (4.4).
prefijo: /api/v1/reservas
capa: backend
permisos: [reservas:ver, reservas:decidir, reservas:solicitar]
archivos:
  - backend/src/modules/reservas/reservas.controller.ts
edges:
  - [belongs_to, domain--reservas]
  - [exposes, service--reservas-reservas]
terminos: [reservas, ver, decidir, solicitar]
---

# ReservasController

Reservas de instalaciones del cuartel (4.4).

- **Prefijo:** `/api/v1/reservas`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/reservas/instalaciones` | `reservas:ver` |
| POST | `/reservas/instalaciones` | `reservas:decidir` |
| PATCH | `/reservas/instalaciones/:id` | `reservas:decidir` |
| POST | `/reservas` | `reservas:solicitar` |
| PATCH | `/reservas/:id/decision` | `reservas:decidir` |
| PATCH | `/reservas/:id/cancelar` | `reservas:solicitar` |

## Archivos

- `backend/src/modules/reservas/reservas.controller.ts`

## Relaciones

- `belongs_to` → [[domain--reservas|Reservas]]
- `exposes` → [[service--reservas-reservas|ReservasService]]

## Referenciado por

- [[component--front-reservas|reservas]] `calls` →
- [[component--front-reservas|reservas]] `calls` →
- [[component--front-reservas|reservas]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
