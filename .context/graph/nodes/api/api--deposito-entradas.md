---
id: api--deposito-entradas
tipo: API
nombre: EntradasController
nivel: L2
dominio: deposito
resumen: Superficie HTTP de entradas bajo /api/v1/deposito/entradas.
prefijo: /api/v1/deposito/entradas
capa: backend
permisos: [deposito:ver, deposito:crear]
archivos:
  - backend/src/modules/deposito/entradas.controller.ts
edges:
  - [belongs_to, domain--deposito]
  - [exposes, service--deposito-entradas]
terminos: [entradas, deposito, ver, crear]
---

# EntradasController

Superficie HTTP de entradas bajo /api/v1/deposito/entradas.

- **Prefijo:** `/api/v1/deposito/entradas`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/deposito/entradas` | `deposito:ver` |
| GET | `/deposito/entradas/:id` | `deposito:ver` |
| GET | `/deposito/entradas/:id/items` | `deposito:ver` |
| POST | `/deposito/entradas` | `deposito:crear` |

## Archivos

- `backend/src/modules/deposito/entradas.controller.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `exposes` → [[service--deposito-entradas|EntradasService]]

## Referenciado por

- [[component--front-deposito|deposito]] `calls` →
- [[component--front-deposito|deposito]] `calls` →
- [[component--front-deposito|deposito]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
