---
id: api--personal-historial-institucional
tipo: API
nombre: HistorialInstitucionalController
nivel: L2
dominio: personal
resumen: Superficie HTTP de historial institucional bajo /api/v1/personal/bomberos.
prefijo: /api/v1/personal/bomberos
capa: backend
permisos: [personal:ver, personal:editar]
archivos:
  - backend/src/modules/personal/historial-institucional.controller.ts
edges:
  - [belongs_to, domain--personal]
  - [exposes, service--personal-historial-institucional]
terminos: [historial, institucional, personal, bomberos, ver, editar]
---

# HistorialInstitucionalController

Superficie HTTP de historial institucional bajo /api/v1/personal/bomberos.

- **Prefijo:** `/api/v1/personal/bomberos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/personal/bomberos/:id/historial` | `personal:ver` |
| POST | `/personal/bomberos/:id/historial` | `personal:editar` |

## Archivos

- `backend/src/modules/personal/historial-institucional.controller.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `exposes` → [[service--personal-historial-institucional|HistorialInstitucionalService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
