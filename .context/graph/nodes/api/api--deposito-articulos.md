---
id: api--deposito-articulos
tipo: API
nombre: ArticulosController
nivel: L2
dominio: deposito
resumen: Superficie HTTP de articulos bajo /api/v1/deposito/articulos.
prefijo: /api/v1/deposito/articulos
capa: backend
permisos: [deposito:ver, deposito:crear, deposito:editar]
archivos:
  - backend/src/modules/deposito/articulos.controller.ts
edges:
  - [belongs_to, domain--deposito]
  - [exposes, service--deposito-articulos]
terminos: [articulos, deposito, ver, crear, editar]
---

# ArticulosController

Superficie HTTP de articulos bajo /api/v1/deposito/articulos.

- **Prefijo:** `/api/v1/deposito/articulos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/deposito/articulos` | `deposito:ver` |
| GET | `/deposito/articulos/:id` | `deposito:ver` |
| GET | `/deposito/articulos/:id/tenencias` | `deposito:ver` |
| POST | `/deposito/articulos` | `deposito:crear` |
| PATCH | `/deposito/articulos/:id` | `deposito:editar` |

## Archivos

- `backend/src/modules/deposito/articulos.controller.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `exposes` → [[service--deposito-articulos|ArticulosService]]

## Referenciado por

- [[component--front-deposito|deposito]] `calls` →
- [[component--front-deposito|deposito]] `calls` →
- [[component--front-deposito|deposito]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
