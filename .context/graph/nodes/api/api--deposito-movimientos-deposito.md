---
id: api--deposito-movimientos-deposito
tipo: API
nombre: MovimientosDepositoController
nivel: L2
dominio: deposito
resumen: Superficie HTTP de movimientos deposito bajo /api/v1/deposito/movimientos.
prefijo: /api/v1/deposito/movimientos
capa: backend
permisos: [deposito:movimiento, deposito:ver]
archivos:
  - backend/src/modules/deposito/movimientos-deposito.controller.ts
edges:
  - [belongs_to, domain--deposito]
  - [exposes, service--deposito-movimientos-deposito]
terminos: [movimientos, deposito, movimiento, ver]
---

# MovimientosDepositoController

Superficie HTTP de movimientos deposito bajo /api/v1/deposito/movimientos.

- **Prefijo:** `/api/v1/deposito/movimientos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| POST | `/deposito/movimientos` | `deposito:movimiento` |
| GET | `/deposito/movimientos/tenencia-equipo/:equipoId` | `deposito:ver` |

## Archivos

- `backend/src/modules/deposito/movimientos-deposito.controller.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `exposes` → [[service--deposito-movimientos-deposito|MovimientosDepositoService]]

## Referenciado por

- [[component--front-deposito|deposito]] `calls` →
- [[component--front-deposito|deposito]] `calls` →
- [[component--front-deposito|deposito]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
