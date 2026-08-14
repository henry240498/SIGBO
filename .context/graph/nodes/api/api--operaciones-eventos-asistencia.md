---
id: api--operaciones-eventos-asistencia
tipo: API
nombre: EventosAsistenciaController
nivel: L2
dominio: asistencia
resumen: Superficie HTTP de eventos asistencia bajo /api/v1/operaciones/eventos.
prefijo: /api/v1/operaciones/eventos
capa: backend
permisos: [asistencia:eventos_ver, asistencia:eventos_crear, asistencia:eventos_editar]
archivos:
  - backend/src/modules/operaciones/eventos-asistencia.controller.ts
edges:
  - [belongs_to, domain--asistencia]
  - [exposes, service--operaciones-eventos-asistencia]
terminos: [eventos, asistencia, operaciones, ver, crear, editar]
---

# EventosAsistenciaController

Superficie HTTP de eventos asistencia bajo /api/v1/operaciones/eventos.

- **Prefijo:** `/api/v1/operaciones/eventos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/operaciones/eventos` | `asistencia:eventos_ver` |
| GET | `/operaciones/eventos/:id` | `asistencia:eventos_ver` |
| POST | `/operaciones/eventos` | `asistencia:eventos_crear` |
| PATCH | `/operaciones/eventos/:id` | `asistencia:eventos_editar` |
| GET | `/operaciones/eventos/:id/participantes` | `asistencia:eventos_ver` |
| POST | `/operaciones/eventos/:id/participantes` | `asistencia:eventos_editar` |
| PATCH | `/operaciones/eventos/:id/participantes/:participanteId` | `asistencia:eventos_editar` |
| POST | `/operaciones/eventos/:id/participantes/:participanteId/calcular-desde-marcaciones` | `asistencia:eventos_editar` |
| DELETE | `/operaciones/eventos/:id/participantes/:participanteId` | `asistencia:eventos_editar` |

## Archivos

- `backend/src/modules/operaciones/eventos-asistencia.controller.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `exposes` → [[service--operaciones-eventos-asistencia|EventosAsistenciaService]]

## Referenciado por

- [[component--front-asistencia|asistencia]] `calls` →
- [[component--front-asistencia|asistencia]] `calls` →
- [[component--front-asistencia|asistencia]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
