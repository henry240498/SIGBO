---
id: api--deposito-lotes-articulo
tipo: API
nombre: LotesArticuloController
nivel: L2
dominio: deposito
resumen: Superficie HTTP de lotes articulo bajo /api/v1/deposito/lotes.
prefijo: /api/v1/deposito/lotes
capa: backend
permisos: [deposito:ver, deposito:crear]
archivos:
  - backend/src/modules/deposito/lotes-articulo.controller.ts
edges:
  - [belongs_to, domain--deposito]
  - [exposes, service--deposito-lotes-articulo]
terminos: [lotes, articulo, deposito, ver, crear]
---

# LotesArticuloController

Superficie HTTP de lotes articulo bajo /api/v1/deposito/lotes.

- **Prefijo:** `/api/v1/deposito/lotes`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/deposito/lotes` | `deposito:ver` |
| GET | `/deposito/lotes/proximos-a-vencer` | `deposito:ver` |
| GET | `/deposito/lotes/:id` | `deposito:ver` |
| POST | `/deposito/lotes` | `deposito:crear` |

## Archivos

- `backend/src/modules/deposito/lotes-articulo.controller.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `exposes` → [[service--deposito-lotes-articulo|LotesArticuloService]]

## Referenciado por

- [[component--front-deposito|deposito]] `calls` →
- [[component--front-deposito|deposito]] `calls` →
- [[component--front-deposito|deposito]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
