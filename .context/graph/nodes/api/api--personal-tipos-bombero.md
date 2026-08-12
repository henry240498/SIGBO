---
id: api--personal-tipos-bombero
tipo: API
nombre: TiposBomberoController
nivel: L2
dominio: personal
resumen: Superficie HTTP de tipos bombero bajo /api/v1/personal/tipos-bombero.
prefijo: /api/v1/personal/tipos-bombero
capa: backend
permisos: [personal:tipos_bombero_ver, personal:tipos_bombero_crear, personal:tipos_bombero_editar, personal:tipos_bombero_eliminar]
archivos:
  - backend/src/modules/personal/tipos-bombero.controller.ts
edges:
  - [belongs_to, domain--personal]
  - [exposes, service--personal-tipos-bombero]
terminos: [tipos, bombero, personal, ver, crear, editar, eliminar]
---

# TiposBomberoController

Superficie HTTP de tipos bombero bajo /api/v1/personal/tipos-bombero.

- **Prefijo:** `/api/v1/personal/tipos-bombero`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/personal/tipos-bombero` | `personal:tipos_bombero_ver` |
| GET | `/personal/tipos-bombero/exportar/excel` | `personal:tipos_bombero_ver` |
| GET | `/personal/tipos-bombero/exportar/pdf` | `personal:tipos_bombero_ver` |
| GET | `/personal/tipos-bombero/:id` | `personal:tipos_bombero_ver` |
| POST | `/personal/tipos-bombero` | `personal:tipos_bombero_crear` |
| PATCH | `/personal/tipos-bombero/:id` | `personal:tipos_bombero_editar` |
| PATCH | `/personal/tipos-bombero/:id/baja` | `personal:tipos_bombero_eliminar` |
| PATCH | `/personal/tipos-bombero/:id/reactivar` | `personal:tipos_bombero_eliminar` |

## Archivos

- `backend/src/modules/personal/tipos-bombero.controller.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `exposes` → [[service--personal-tipos-bombero|TiposBomberoService]]

## Referenciado por

- [[screen--dashboard-organizacion-tipos-bombero|/dashboard/organizacion/tipos-bombero]] `calls` →
- [[screen--dashboard-organizacion-tipos-bombero|/dashboard/organizacion/tipos-bombero]] `calls` →
- [[screen--dashboard-organizacion-tipos-bombero|/dashboard/organizacion/tipos-bombero]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
