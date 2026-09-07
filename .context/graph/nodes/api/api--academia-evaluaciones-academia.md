---
id: api--academia-evaluaciones-academia
tipo: API
nombre: EvaluacionesAcademiaController
nivel: L2
dominio: academia
resumen: Superficie HTTP de evaluaciones academia bajo /api/v1/academia.
prefijo: /api/v1/academia
capa: backend
permisos: [academia:ver, academia:calificar]
archivos:
  - backend/src/modules/academia/evaluaciones-academia.controller.ts
edges:
  - [belongs_to, domain--academia]
  - [exposes, service--academia-evaluaciones-academia]
terminos: [evaluaciones, academia, ver, calificar]
---

# EvaluacionesAcademiaController

Superficie HTTP de evaluaciones academia bajo /api/v1/academia.

- **Prefijo:** `/api/v1/academia`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/academia/actividades/:id/evaluaciones` | `academia:ver` |
| POST | `/academia/actividades/:id/evaluaciones` | `academia:calificar` |
| GET | `/academia/evaluaciones/:evaluacionId/notas` | `academia:ver` |
| PUT | `/academia/evaluaciones/:evaluacionId/notas/:inscripcionId` | `academia:calificar` |

## Archivos

- `backend/src/modules/academia/evaluaciones-academia.controller.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `exposes` → [[service--academia-evaluaciones-academia|EvaluacionesAcademiaService]]

## Referenciado por

- [[component--front-academia|academia]] `calls` →
- [[component--front-academia|academia]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
