---
id: api--personal-condicion
tipo: API
nombre: CondicionController
nivel: L2
dominio: personal
resumen: Superficie HTTP de condicion bajo /api/v1/personal/bomberos.
prefijo: /api/v1/personal/bomberos
capa: backend
permisos: [personal:ver, personal:editar]
archivos:
  - backend/src/modules/personal/condicion.controller.ts
edges:
  - [belongs_to, domain--personal]
  - [exposes, service--personal-condicion]
terminos: [condicion, personal, bomberos, ver, editar]
---

# CondicionController

Superficie HTTP de condicion bajo /api/v1/personal/bomberos.

- **Prefijo:** `/api/v1/personal/bomberos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/personal/bomberos/:id/condicion` | `personal:ver` |
| PUT | `/personal/bomberos/:id/condicion` | `personal:editar` |

## Archivos

- `backend/src/modules/personal/condicion.controller.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `exposes` → [[service--personal-condicion|CondicionService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
