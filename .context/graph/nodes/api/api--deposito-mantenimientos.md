---
id: api--deposito-mantenimientos
tipo: API
nombre: MantenimientosController
nivel: L2
dominio: deposito
resumen: Superficie HTTP de mantenimientos bajo /api/v1/deposito/mantenimientos.
prefijo: /api/v1/deposito/mantenimientos
capa: backend
permisos: [deposito:ver, deposito:mantenimiento]
archivos:
  - backend/src/modules/deposito/mantenimientos.controller.ts
edges:
  - [belongs_to, domain--deposito]
  - [exposes, service--deposito-mantenimientos]
terminos: [mantenimientos, deposito, ver, mantenimiento]
---

# MantenimientosController

Superficie HTTP de mantenimientos bajo /api/v1/deposito/mantenimientos.

- **Prefijo:** `/api/v1/deposito/mantenimientos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/deposito/mantenimientos` | `deposito:ver` |
| GET | `/deposito/mantenimientos/:id` | `deposito:ver` |
| POST | `/deposito/mantenimientos` | `deposito:mantenimiento` |
| PATCH | `/deposito/mantenimientos/:id/finalizar` | `deposito:mantenimiento` |

## Archivos

- `backend/src/modules/deposito/mantenimientos.controller.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `exposes` → [[service--deposito-mantenimientos|MantenimientosService]]

## Referenciado por

- [[component--front-deposito|deposito]] `calls` →
- [[component--front-deposito|deposito]] `calls` →
- [[component--front-deposito|deposito]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
