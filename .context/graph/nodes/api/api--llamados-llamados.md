---
id: api--llamados-llamados
tipo: API
nombre: LlamadosController
nivel: L2
dominio: servicios
resumen: "Cuadro de llamados del radio operador (2.1) y convocatorias al personal (2.2). Llamados reutiliza servicios:ver/crear/editar; las convocatorias agregan servicios:convocar. Responder solo exige servicios:ver (los usuarios de la app)."
prefijo: /api/v1
capa: backend
permisos: [servicios:ver, servicios:crear, servicios:editar, servicios:convocar]
archivos:
  - backend/src/modules/llamados/llamados.controller.ts
edges:
  - [belongs_to, domain--servicios]
  - [exposes, service--llamados-llamados]
terminos: [llamados, servicios, ver, crear, editar, convocar]
---

# LlamadosController

Cuadro de llamados del radio operador (2.1) y convocatorias al personal (2.2). Llamados reutiliza servicios:ver/crear/editar; las convocatorias agregan servicios:convocar. Responder solo exige servicios:ver (los usuarios de la app).

- **Prefijo:** `/api/v1`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/llamados` | `servicios:ver` |
| GET | `/llamados/:id` | `servicios:ver` |
| POST | `/llamados` | `servicios:crear` |
| PATCH | `/llamados/:id/estado` | `servicios:editar` |
| GET | `/convocatorias/abiertas` | `servicios:ver` |
| GET | `/convocatorias` | `servicios:convocar` |
| GET | `/convocatorias/:id` | `servicios:convocar` |
| POST | `/convocatorias` | `servicios:convocar` |
| POST | `/convocatorias/:id/respuesta` | `servicios:ver` |
| POST | `/convocatorias/:id/en-camino` | `servicios:ver` |
| POST | `/convocatorias/:id/cancelar-asistencia` | `servicios:ver` |
| PATCH | `/convocatorias/:id/cerrar` | `servicios:convocar` |

## Archivos

- `backend/src/modules/llamados/llamados.controller.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `exposes` → [[service--llamados-llamados|LlamadosService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
