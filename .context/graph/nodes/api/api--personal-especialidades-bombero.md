---
id: api--personal-especialidades-bombero
tipo: API
nombre: EspecialidadesBomberoController
nivel: L2
dominio: personal
resumen: Superficie HTTP de especialidades bombero bajo /api/v1/personal/bomberos.
prefijo: /api/v1/personal/bomberos
capa: backend
permisos: [personal:ver, personal:editar]
archivos:
  - backend/src/modules/personal/especialidades-bombero.controller.ts
edges:
  - [belongs_to, domain--personal]
  - [exposes, service--personal-especialidades-bombero]
terminos: [especialidades, bombero, personal, bomberos, ver, editar]
---

# EspecialidadesBomberoController

Superficie HTTP de especialidades bombero bajo /api/v1/personal/bomberos.

- **Prefijo:** `/api/v1/personal/bomberos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/personal/bomberos/:id/especialidades` | `personal:ver` |
| PUT | `/personal/bomberos/:id/especialidades` | `personal:editar` |

## Archivos

- `backend/src/modules/personal/especialidades-bombero.controller.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `exposes` → [[service--personal-especialidades-bombero|EspecialidadesBomberoService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
