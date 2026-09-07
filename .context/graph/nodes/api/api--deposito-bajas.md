---
id: api--deposito-bajas
tipo: API
nombre: BajasController
nivel: L2
dominio: deposito
resumen: Superficie HTTP de bajas bajo /api/v1/deposito/bajas.
prefijo: /api/v1/deposito/bajas
capa: backend
permisos: [deposito:ver, deposito:baja]
archivos:
  - backend/src/modules/deposito/bajas.controller.ts
edges:
  - [belongs_to, domain--deposito]
  - [exposes, service--deposito-bajas]
terminos: [bajas, deposito, ver, baja]
---

# BajasController

Superficie HTTP de bajas bajo /api/v1/deposito/bajas.

- **Prefijo:** `/api/v1/deposito/bajas`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/deposito/bajas` | `deposito:ver` |
| GET | `/deposito/bajas/:id` | `deposito:ver` |
| POST | `/deposito/bajas` | `deposito:baja` |

## Archivos

- `backend/src/modules/deposito/bajas.controller.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `exposes` → [[service--deposito-bajas|BajasService]]

## Referenciado por

- [[component--front-deposito|deposito]] `calls` →
- [[component--front-deposito|deposito]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
