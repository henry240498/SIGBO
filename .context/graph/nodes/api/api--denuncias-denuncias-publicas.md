---
id: api--denuncias-denuncias-publicas
tipo: API
nombre: DenunciasPublicasController
nivel: L2
dominio: denuncias
resumen: Superficie HTTP de denuncias publicas bajo /api/v1/denuncias/publicas.
prefijo: /api/v1/denuncias/publicas
capa: backend
archivos:
  - backend/src/modules/denuncias/denuncias-publicas.controller.ts
edges:
  - [belongs_to, domain--denuncias]
  - [exposes, service--denuncias-denuncias]
terminos: [denuncias, publicas]
---

# DenunciasPublicasController

Superficie HTTP de denuncias publicas bajo /api/v1/denuncias/publicas.

- **Prefijo:** `/api/v1/denuncias/publicas`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/denuncias/publicas/categorias` | — |

## Archivos

- `backend/src/modules/denuncias/denuncias-publicas.controller.ts`

## Relaciones

- `belongs_to` → [[domain--denuncias|Denuncias]]
- `exposes` → [[service--denuncias-denuncias|DenunciasService]]

## Referenciado por

- [[decision--rate-limit-propio|Rate limiting propio en memoria en vez de @nestjs/throttler]] `constrains` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
