---
id: api--academia-inscripciones-academia
tipo: API
nombre: InscripcionesAcademiaController
nivel: L2
dominio: academia
resumen: Superficie HTTP de inscripciones academia bajo /api/v1/academia/actividades.
prefijo: /api/v1/academia/actividades
capa: backend
permisos: [academia:ver, academia:inscribir, academia:calificar]
archivos:
  - backend/src/modules/academia/inscripciones-academia.controller.ts
edges:
  - [belongs_to, domain--academia]
  - [exposes, service--academia-inscripciones-academia]
terminos: [inscripciones, academia, actividades, ver, inscribir, calificar]
---

# InscripcionesAcademiaController

Superficie HTTP de inscripciones academia bajo /api/v1/academia/actividades.

- **Prefijo:** `/api/v1/academia/actividades`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/academia/actividades/:id/participantes` | `academia:ver` |
| POST | `/academia/actividades/:id/participantes` | `academia:inscribir` |
| PATCH | `/academia/actividades/:id/participantes/:inscripcionId` | `academia:calificar` |
| DELETE | `/academia/actividades/:id/participantes/:inscripcionId` | `academia:inscribir` |

## Archivos

- `backend/src/modules/academia/inscripciones-academia.controller.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `exposes` → [[service--academia-inscripciones-academia|InscripcionesAcademiaService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
