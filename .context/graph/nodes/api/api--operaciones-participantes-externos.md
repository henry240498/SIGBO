---
id: api--operaciones-participantes-externos
tipo: API
nombre: ParticipantesExternosController
nivel: L2
dominio: asistencia
resumen: Superficie HTTP de participantes externos bajo /api/v1/operaciones/externos.
prefijo: /api/v1/operaciones/externos
capa: backend
permisos: [asistencia:externos_ver, asistencia:externos_crear, asistencia:externos_editar]
archivos:
  - backend/src/modules/operaciones/participantes-externos.controller.ts
edges:
  - [belongs_to, domain--asistencia]
  - [exposes, service--operaciones-participantes-externos]
terminos: [participantes, externos, operaciones, asistencia, ver, crear, editar]
---

# ParticipantesExternosController

Superficie HTTP de participantes externos bajo /api/v1/operaciones/externos.

- **Prefijo:** `/api/v1/operaciones/externos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/operaciones/externos` | `asistencia:externos_ver` |
| GET | `/operaciones/externos/:id` | `asistencia:externos_ver` |
| POST | `/operaciones/externos` | `asistencia:externos_crear` |
| PATCH | `/operaciones/externos/:id` | `asistencia:externos_editar` |

## Archivos

- `backend/src/modules/operaciones/participantes-externos.controller.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `exposes` → [[service--operaciones-participantes-externos|ParticipantesExternosService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
