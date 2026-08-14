---
id: api--operaciones-marcaciones
tipo: API
nombre: MarcacionesController
nivel: L2
dominio: asistencia
resumen: Superficie HTTP de marcaciones bajo /api/v1/operaciones/marcaciones.
prefijo: /api/v1/operaciones/marcaciones
capa: backend
permisos: [asistencia:asistencia_crear, asistencia:asistencia_ver]
archivos:
  - backend/src/modules/operaciones/marcaciones.controller.ts
edges:
  - [belongs_to, domain--asistencia]
  - [exposes, service--operaciones-marcaciones]
  - [exposes, service--operaciones-eventos-asistencia]
terminos: [marcaciones, operaciones, asistencia, crear, ver]
---

# MarcacionesController

Superficie HTTP de marcaciones bajo /api/v1/operaciones/marcaciones.

- **Prefijo:** `/api/v1/operaciones/marcaciones`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| POST | `/operaciones/marcaciones` | `asistencia:asistencia_crear` |
| GET | `/operaciones/marcaciones/bombero/:bomberoId` | `asistencia:asistencia_ver` |
| GET | `/operaciones/marcaciones/dia/:fecha` | `asistencia:asistencia_ver` |
| GET | `/operaciones/marcaciones/solapamiento/:eventoId/:bomberoId` | `asistencia:asistencia_ver` |

## Archivos

- `backend/src/modules/operaciones/marcaciones.controller.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `exposes` → [[service--operaciones-marcaciones|MarcacionesService]]
- `exposes` → [[service--operaciones-eventos-asistencia|EventosAsistenciaService]]

## Referenciado por

- [[component--front-asistencia|asistencia]] `calls` →
- [[component--front-asistencia|asistencia]] `calls` →
- [[component--front-asistencia|asistencia]] `calls` →
- [[component--front-asistencia|asistencia]] `calls` →
- [[component--front-asistencia|asistencia]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
