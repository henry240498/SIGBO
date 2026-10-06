---
id: api--despacho-servicio-activo
tipo: API
nombre: ServicioActivoController
nivel: L2
dominio: servicios
resumen: Superficie HTTP de servicio activo bajo /api/v1/despacho.
prefijo: /api/v1/despacho
capa: backend
permisos: [despacho:servicio, despacho:formularios_admin]
archivos:
  - backend/src/modules/despacho/servicio-activo.controller.ts
edges:
  - [belongs_to, domain--servicios]
  - [exposes, service--despacho-servicio-activo]
terminos: [servicio, activo, despacho, formularios, admin]
---

# ServicioActivoController

Superficie HTTP de servicio activo bajo /api/v1/despacho.

- **Prefijo:** `/api/v1/despacho`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/despacho/servicios-activos` | `despacho:servicio` |
| GET | `/despacho/servicios/:id` | `despacho:servicio` |
| POST | `/despacho/servicios/:id/unirme` | `despacho:servicio` |
| PATCH | `/despacho/servicios/:id/mi-estado` | `despacho:servicio` |
| GET | `/despacho/servicios/:id/mapa` | `despacho:servicio` |
| GET | `/despacho/servicios/:id/mensajes` | `despacho:servicio` |
| POST | `/despacho/servicios/:id/mensajes` | `despacho:servicio` |
| GET | `/despacho/servicios/:id/formularios` | `despacho:servicio` |
| POST | `/despacho/servicios/:id/formularios` | `despacho:servicio` |
| PATCH | `/despacho/formularios/:id` | `despacho:servicio` |
| POST | `/despacho/formularios/:id/anular` | `despacho:servicio` |
| GET | `/despacho/formularios/:id/historial` | `despacho:servicio` |
| POST | `/despacho/formularios-definiciones` | `despacho:formularios_admin` |

## Archivos

- `backend/src/modules/despacho/servicio-activo.controller.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `exposes` → [[service--despacho-servicio-activo|ServicioActivoService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
