---
id: api--personal-actividad-profesional
tipo: API
nombre: ActividadProfesionalController
nivel: L2
dominio: personal
resumen: Superficie HTTP de actividad profesional bajo /api/v1/personal/bomberos.
prefijo: /api/v1/personal/bomberos
capa: backend
permisos: [personal:ver, personal:editar]
archivos:
  - backend/src/modules/personal/actividad-profesional.controller.ts
edges:
  - [belongs_to, domain--personal]
  - [exposes, service--personal-actividad-profesional]
terminos: [actividad, profesional, personal, bomberos, ver, editar]
---

# ActividadProfesionalController

Superficie HTTP de actividad profesional bajo /api/v1/personal/bomberos.

- **Prefijo:** `/api/v1/personal/bomberos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/personal/bomberos/:id/actividad-profesional` | `personal:ver` |
| PUT | `/personal/bomberos/:id/actividad-profesional` | `personal:editar` |

## Archivos

- `backend/src/modules/personal/actividad-profesional.controller.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `exposes` → [[service--personal-actividad-profesional|ActividadProfesionalService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
