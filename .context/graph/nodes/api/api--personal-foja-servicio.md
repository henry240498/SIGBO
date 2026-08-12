---
id: api--personal-foja-servicio
tipo: API
nombre: FojaServicioController
nivel: L2
dominio: personal
resumen: Superficie HTTP de foja servicio bajo /api/v1/personal/bomberos.
prefijo: /api/v1/personal/bomberos
capa: backend
permisos: [personal:generar_foja, personal:ver]
archivos:
  - backend/src/modules/personal/foja-servicio.controller.ts
edges:
  - [belongs_to, domain--personal]
  - [exposes, service--personal-foja-servicio]
terminos: [foja, servicio, personal, bomberos, generar, ver]
---

# FojaServicioController

Superficie HTTP de foja servicio bajo /api/v1/personal/bomberos.

- **Prefijo:** `/api/v1/personal/bomberos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| POST | `/personal/bomberos/:id/foja-servicio` | `personal:generar_foja` |
| GET | `/personal/bomberos/:id/foja-servicio` | `personal:ver` |
| GET | `/personal/bomberos/:id/foja-servicio/:anio` | `personal:ver` |

## Archivos

- `backend/src/modules/personal/foja-servicio.controller.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `exposes` → [[service--personal-foja-servicio|FojaServicioService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
