---
id: api--deposito-integracion-deposito
tipo: API
nombre: IntegracionDepositoController
nivel: L2
dominio: deposito
resumen: Superficie HTTP de integracion deposito bajo /api/v1/deposito.
prefijo: /api/v1/deposito
capa: backend
permisos: [deposito:ver]
archivos:
  - backend/src/modules/deposito/integracion-deposito.controller.ts
edges:
  - [belongs_to, domain--deposito]
  - [exposes, service--deposito-integracion-deposito]
terminos: [integracion, deposito, ver]
---

# IntegracionDepositoController

Superficie HTTP de integracion deposito bajo /api/v1/deposito.

- **Prefijo:** `/api/v1/deposito`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/deposito/equipos/:equipoId/ubicacion` | `deposito:ver` |
| GET | `/deposito/vehiculos/:vehiculoId/equipamiento` | `deposito:ver` |
| GET | `/deposito/personal/:bomberoId/equipamiento` | `deposito:ver` |

## Archivos

- `backend/src/modules/deposito/integracion-deposito.controller.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `exposes` → [[service--deposito-integracion-deposito|IntegracionDepositoService]]

## Referenciado por

- [[component--front-deposito|deposito]] `calls` →
- [[component--front-deposito|deposito]] `calls` →
- [[component--front-deposito|deposito]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
