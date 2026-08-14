---
id: api--equipos-categorias-equipo
tipo: API
nombre: CategoriasEquipoController
nivel: L2
dominio: equipos
resumen: Superficie HTTP de categorias equipo bajo /api/v1/equipos/categorias.
prefijo: /api/v1/equipos/categorias
capa: backend
permisos: [equipos:ver, equipos:crear, equipos:editar, equipos:eliminar]
archivos:
  - backend/src/modules/equipos/categorias-equipo.controller.ts
edges:
  - [belongs_to, domain--equipos]
  - [exposes, service--equipos-categorias-equipo]
terminos: [categorias, equipo, equipos, ver, crear, editar, eliminar]
---

# CategoriasEquipoController

Superficie HTTP de categorias equipo bajo /api/v1/equipos/categorias.

- **Prefijo:** `/api/v1/equipos/categorias`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/equipos/categorias` | `equipos:ver` |
| GET | `/equipos/categorias/:id` | `equipos:ver` |
| POST | `/equipos/categorias` | `equipos:crear` |
| PATCH | `/equipos/categorias/:id` | `equipos:editar` |
| DELETE | `/equipos/categorias/:id` | `equipos:eliminar` |

## Archivos

- `backend/src/modules/equipos/categorias-equipo.controller.ts`

## Relaciones

- `belongs_to` → [[domain--equipos|Equipos]]
- `exposes` → [[service--equipos-categorias-equipo|CategoriasEquipoService]]

## Referenciado por

- [[component--front-equipos|equipos]] `calls` →
- [[component--front-equipos|equipos]] `calls` →
- [[component--front-equipos|equipos]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
