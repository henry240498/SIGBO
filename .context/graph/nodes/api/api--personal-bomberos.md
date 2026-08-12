---
id: api--personal-bomberos
tipo: API
nombre: BomberosController
nivel: L2
dominio: personal
resumen: Superficie HTTP de bomberos bajo /api/v1/personal/bomberos.
prefijo: /api/v1/personal/bomberos
capa: backend
permisos: [personal:ver, personal:crear, personal:editar, personal:eliminar, personal:eliminar_fisico]
archivos:
  - backend/src/modules/personal/bomberos.controller.ts
edges:
  - [belongs_to, domain--personal]
  - [exposes, service--personal-bomberos]
terminos: [bomberos, personal, ver, crear, editar, eliminar, fisico]
---

# BomberosController

Superficie HTTP de bomberos bajo /api/v1/personal/bomberos.

- **Prefijo:** `/api/v1/personal/bomberos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/personal/bomberos` | `personal:ver` |
| GET | `/personal/bomberos/exportar/excel` | `personal:ver` |
| GET | `/personal/bomberos/exportar/pdf` | `personal:ver` |
| GET | `/personal/bomberos/:id` | `personal:ver` |
| POST | `/personal/bomberos` | `personal:crear` |
| PATCH | `/personal/bomberos/:id` | `personal:editar` |
| PATCH | `/personal/bomberos/:id/baja` | `personal:eliminar` |
| DELETE | `/personal/bomberos/:id` | `personal:eliminar_fisico` |

## Archivos

- `backend/src/modules/personal/bomberos.controller.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `exposes` → [[service--personal-bomberos|BomberosService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
