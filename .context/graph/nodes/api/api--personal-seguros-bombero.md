---
id: api--personal-seguros-bombero
tipo: API
nombre: SegurosBomberoController
nivel: L2
dominio: personal
resumen: Superficie HTTP de seguros bombero bajo /api/v1/personal/bomberos.
prefijo: /api/v1/personal/bomberos
capa: backend
permisos: [personal:seguros_ver, personal:seguros_crear, personal:seguros_editar, personal:seguros_eliminar]
archivos:
  - backend/src/modules/personal/seguros-bombero.controller.ts
edges:
  - [belongs_to, domain--personal]
  - [exposes, service--personal-seguros-bombero]
terminos: [seguros, bombero, personal, bomberos, ver, crear, editar, eliminar]
---

# SegurosBomberoController

Superficie HTTP de seguros bombero bajo /api/v1/personal/bomberos.

- **Prefijo:** `/api/v1/personal/bomberos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/personal/bomberos/:id/seguros` | `personal:seguros_ver` |
| POST | `/personal/bomberos/:id/seguros` | `personal:seguros_crear` |
| PATCH | `/personal/bomberos/:id/seguros/:seguroId` | `personal:seguros_editar` |
| PATCH | `/personal/bomberos/:id/seguros/:seguroId/baja` | `personal:seguros_eliminar` |

## Archivos

- `backend/src/modules/personal/seguros-bombero.controller.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `exposes` → [[service--personal-seguros-bombero|SegurosBomberoService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
