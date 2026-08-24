---
id: api--deposito-ubicaciones-deposito
tipo: API
nombre: UbicacionesDepositoController
nivel: L2
dominio: deposito
resumen: Superficie HTTP de ubicaciones deposito bajo /api/v1/deposito/ubicaciones.
prefijo: /api/v1/deposito/ubicaciones
capa: backend
permisos: [deposito:ver, deposito:crear, deposito:editar, deposito:eliminar]
archivos:
  - backend/src/modules/deposito/ubicaciones-deposito.controller.ts
edges:
  - [belongs_to, domain--deposito]
  - [exposes, service--deposito-ubicaciones-deposito]
terminos: [ubicaciones, deposito, ver, crear, editar, eliminar]
---

# UbicacionesDepositoController

Superficie HTTP de ubicaciones deposito bajo /api/v1/deposito/ubicaciones.

- **Prefijo:** `/api/v1/deposito/ubicaciones`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/deposito/ubicaciones` | `deposito:ver` |
| GET | `/deposito/ubicaciones/:id` | `deposito:ver` |
| POST | `/deposito/ubicaciones` | `deposito:crear` |
| PATCH | `/deposito/ubicaciones/:id` | `deposito:editar` |
| DELETE | `/deposito/ubicaciones/:id` | `deposito:eliminar` |

## Archivos

- `backend/src/modules/deposito/ubicaciones-deposito.controller.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `exposes` → [[service--deposito-ubicaciones-deposito|UbicacionesDepositoService]]

## Referenciado por

- [[component--front-deposito|deposito]] `calls` →
- [[component--front-deposito|deposito]] `calls` →
- [[component--front-deposito|deposito]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
