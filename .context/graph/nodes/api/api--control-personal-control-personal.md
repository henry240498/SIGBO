---
id: api--control-personal-control-personal
tipo: API
nombre: ControlPersonalController
nivel: L2
dominio: asistencia
resumen: "Control del personal: aptitudes y vencimientos (3.1), horas de servicio (3.3) y fichaje por QR (3.5). Reutiliza permisos existentes de personal, guardias y asistencia: el dato medico sigue protegido por personal:ver_medico / editar_medico."
prefijo: /api/v1
capa: backend
permisos: [personal:ver, personal:editar, guardias:ver, guardias:editar, asistencia:ver, asistencia:editar, asistencia:marcar]
archivos:
  - backend/src/modules/control-personal/control-personal.controller.ts
edges:
  - [belongs_to, domain--asistencia]
  - [exposes, service--control-personal-vencimientos]
  - [exposes, service--control-personal-horas-servicio]
  - [exposes, service--control-personal-fichaje]
terminos: [control, personal, ver, editar, guardias, asistencia, marcar]
---

# ControlPersonalController

Control del personal: aptitudes y vencimientos (3.1), horas de servicio (3.3) y fichaje por QR (3.5). Reutiliza permisos existentes de personal, guardias y asistencia: el dato medico sigue protegido por personal:ver_medico / editar_medico.

- **Prefijo:** `/api/v1`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/aptitudes/vencimientos` | `personal:ver` |
| GET | `/aptitudes/bombero/:bomberoId` | `personal:ver` |
| POST | `/aptitudes` | `personal:editar` |
| PATCH | `/aptitudes/:id` | `personal:editar` |
| GET | `/horas-servicio` | `guardias:ver` |
| GET | `/horas-servicio/limites` | `guardias:ver` |
| PUT | `/horas-servicio/limites` | `guardias:editar` |
| GET | `/fichaje/puntos` | `asistencia:ver` |
| POST | `/fichaje/puntos` | `asistencia:editar` |
| PATCH | `/fichaje/puntos/:id` | `asistencia:editar` |
| POST | `/fichaje/puntos/:id/regenerar` | `asistencia:editar` |
| POST | `/fichaje/escanear` | `asistencia:marcar` |
| GET | `/fichaje/mios` | `asistencia:marcar` |
| GET | `/fichaje` | `asistencia:ver` |

## Archivos

- `backend/src/modules/control-personal/control-personal.controller.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `exposes` → [[service--control-personal-vencimientos|VencimientosService]]
- `exposes` → [[service--control-personal-horas-servicio|HorasServicioService]]
- `exposes` → [[service--control-personal-fichaje|FichajeService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
