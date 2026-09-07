---
id: api--deposito-categorias-articulo
tipo: API
nombre: CategoriasArticuloController
nivel: L2
dominio: deposito
resumen: Superficie HTTP de categorias articulo bajo /api/v1/deposito/categorias.
prefijo: /api/v1/deposito/categorias
capa: backend
permisos: [deposito:ver, deposito:crear, deposito:editar, deposito:eliminar]
archivos:
  - backend/src/modules/deposito/categorias-articulo.controller.ts
edges:
  - [belongs_to, domain--deposito]
  - [exposes, service--deposito-categorias-articulo]
terminos: [categorias, articulo, deposito, ver, crear, editar, eliminar]
---

# CategoriasArticuloController

Superficie HTTP de categorias articulo bajo /api/v1/deposito/categorias.

- **Prefijo:** `/api/v1/deposito/categorias`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/deposito/categorias` | `deposito:ver` |
| GET | `/deposito/categorias/:id` | `deposito:ver` |
| POST | `/deposito/categorias` | `deposito:crear` |
| PATCH | `/deposito/categorias/:id` | `deposito:editar` |
| DELETE | `/deposito/categorias/:id` | `deposito:eliminar` |

## Archivos

- `backend/src/modules/deposito/categorias-articulo.controller.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `exposes` → [[service--deposito-categorias-articulo|CategoriasArticuloService]]

## Referenciado por

- [[component--front-deposito|deposito]] `calls` →
- [[component--front-deposito|deposito]] `calls` →
- [[component--front-deposito|deposito]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
