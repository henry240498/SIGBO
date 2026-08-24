---
id: api--deposito-inventarios-fisicos
tipo: API
nombre: InventariosFisicosController
nivel: L2
dominio: deposito
resumen: Superficie HTTP de inventarios fisicos bajo /api/v1/deposito/inventarios-fisicos.
prefijo: /api/v1/deposito/inventarios-fisicos
capa: backend
permisos: [deposito:ver, deposito:inventario_fisico]
archivos:
  - backend/src/modules/deposito/inventarios-fisicos.controller.ts
edges:
  - [belongs_to, domain--deposito]
  - [exposes, service--deposito-inventarios-fisicos]
terminos: [inventarios, fisicos, deposito, ver, inventario, fisico]
---

# InventariosFisicosController

Superficie HTTP de inventarios fisicos bajo /api/v1/deposito/inventarios-fisicos.

- **Prefijo:** `/api/v1/deposito/inventarios-fisicos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/deposito/inventarios-fisicos` | `deposito:ver` |
| GET | `/deposito/inventarios-fisicos/:id` | `deposito:ver` |
| GET | `/deposito/inventarios-fisicos/:id/items` | `deposito:ver` |
| POST | `/deposito/inventarios-fisicos` | `deposito:inventario_fisico` |
| POST | `/deposito/inventarios-fisicos/:id/items` | `deposito:inventario_fisico` |
| PATCH | `/deposito/inventarios-fisicos/:id/finalizar` | `deposito:inventario_fisico` |

## Archivos

- `backend/src/modules/deposito/inventarios-fisicos.controller.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `exposes` → [[service--deposito-inventarios-fisicos|InventariosFisicosService]]

## Referenciado por

- [[component--front-deposito|deposito]] `calls` →
- [[component--front-deposito|deposito]] `calls` →
- [[component--front-deposito|deposito]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
