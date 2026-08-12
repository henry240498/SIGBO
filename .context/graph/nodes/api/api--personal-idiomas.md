---
id: api--personal-idiomas
tipo: API
nombre: IdiomasController
nivel: L2
dominio: personal
resumen: Superficie HTTP de idiomas bajo /api/v1/personal/bomberos.
prefijo: /api/v1/personal/bomberos
capa: backend
permisos: [personal:ver, personal:editar]
archivos:
  - backend/src/modules/personal/idiomas.controller.ts
edges:
  - [belongs_to, domain--personal]
  - [exposes, service--personal-idiomas]
terminos: [idiomas, personal, bomberos, ver, editar]
---

# IdiomasController

Superficie HTTP de idiomas bajo /api/v1/personal/bomberos.

- **Prefijo:** `/api/v1/personal/bomberos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/personal/bomberos/:id/idiomas` | `personal:ver` |
| PUT | `/personal/bomberos/:id/idiomas` | `personal:editar` |

## Archivos

- `backend/src/modules/personal/idiomas.controller.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `exposes` → [[service--personal-idiomas|IdiomasService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
