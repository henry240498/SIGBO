---
id: api--equipos-categorias-equipo
tipo: API
nombre: CategoriasEquipoController
nivel: L2
dominio: equipos
resumen: Superficie HTTP de categorias equipo bajo /api/v1/equipos/categorias.
prefijo: /api/v1/equipos/categorias
capa: backend
<<<<<<< Updated upstream
permisos: [equipos:ver, equipos:crear, equipos:editar, equipos:eliminar]
=======
permisos: [equipos:ver, equipos:crear, equipos:editar]
>>>>>>> Stashed changes
archivos:
  - backend/src/modules/equipos/categorias-equipo.controller.ts
edges:
  - [belongs_to, domain--equipos]
  - [exposes, service--equipos-categorias-equipo]
<<<<<<< Updated upstream
terminos: [categorias, equipo, equipos, ver, crear, editar, eliminar]
=======
terminos: [categorias, equipo, equipos, ver, crear, editar]
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
| DELETE | `/equipos/categorias/:id` | `equipos:eliminar` |
=======
| DELETE | `/equipos/categorias/:id` | `equipos:editar` |
>>>>>>> Stashed changes

## Archivos

- `backend/src/modules/equipos/categorias-equipo.controller.ts`

## Relaciones

- `belongs_to` → [[domain--equipos|Equipos]]
- `exposes` → [[service--equipos-categorias-equipo|CategoriasEquipoService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
