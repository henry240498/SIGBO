---
id: api--servicios-servicios
tipo: API
nombre: ServiciosController
nivel: L2
dominio: servicios
resumen: Superficie HTTP de servicios bajo /api/v1/servicios/comunicaciones.
prefijo: /api/v1/servicios/comunicaciones
capa: backend
permisos: [servicios:ver, servicios:crear, servicios:editar, servicios:finalizar, servicios:eliminar]
archivos:
  - backend/src/modules/servicios/servicios.controller.ts
edges:
  - [belongs_to, domain--servicios]
  - [exposes, service--servicios-servicios]
terminos: [servicios, comunicaciones, ver, crear, editar, finalizar, eliminar]
---

# ServiciosController

Superficie HTTP de servicios bajo /api/v1/servicios/comunicaciones.

- **Prefijo:** `/api/v1/servicios/comunicaciones`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/servicios/comunicaciones` | `servicios:ver` |
| GET | `/servicios/comunicaciones/catalogos` | `servicios:ver` |
| GET | `/servicios/comunicaciones/:id` | `servicios:ver` |
| POST | `/servicios/comunicaciones` | `servicios:crear` |
| PATCH | `/servicios/comunicaciones/:id` | `servicios:editar` |
| POST | `/servicios/comunicaciones/:id/finalizar` | `servicios:finalizar` |
| POST | `/servicios/comunicaciones/:id/enviar-revision` | `servicios:editar` |
| POST | `/servicios/comunicaciones/:id/observar` | `servicios:editar` |
| POST | `/servicios/comunicaciones/:id/reabrir` | `servicios:editar` |
| POST | `/servicios/comunicaciones/:id/anular` | `servicios:eliminar` |
| DELETE | `/servicios/comunicaciones/:id` | `servicios:eliminar` |

## Archivos

- `backend/src/modules/servicios/servicios.controller.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `exposes` → [[service--servicios-servicios|ServiciosService]]

## Referenciado por

- [[screen--dashboard-servicios-nuevo|/dashboard/servicios/nuevo]] `calls` →
- [[screen--dashboard-servicios-nuevo|/dashboard/servicios/nuevo]] `calls` →
- [[screen--dashboard-servicios|/dashboard/servicios]] `calls` →
<<<<<<< Updated upstream
=======
- [[workflow--comunicacion-de-servicio|Ciclo de vida de la comunicacion de servicio]] `affects` →
>>>>>>> Stashed changes

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
