---
id: api--deposito-alertas-deposito
tipo: API
nombre: AlertasDepositoController
nivel: L2
dominio: deposito
resumen: Superficie HTTP de alertas deposito bajo /api/v1/deposito/alertas.
prefijo: /api/v1/deposito/alertas
capa: backend
permisos: [deposito:ver]
archivos:
  - backend/src/modules/deposito/alertas-deposito.controller.ts
edges:
  - [belongs_to, domain--deposito]
  - [exposes, service--deposito-alertas-deposito]
terminos: [alertas, deposito, ver]
---

# AlertasDepositoController

Superficie HTTP de alertas deposito bajo /api/v1/deposito/alertas.

- **Prefijo:** `/api/v1/deposito/alertas`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/deposito/alertas` | `deposito:ver` |

## Archivos

- `backend/src/modules/deposito/alertas-deposito.controller.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `exposes` → [[service--deposito-alertas-deposito|AlertasDepositoService]]

## Referenciado por

- [[component--front-deposito|deposito]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
