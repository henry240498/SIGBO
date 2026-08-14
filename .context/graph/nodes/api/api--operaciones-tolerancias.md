---
id: api--operaciones-tolerancias
tipo: API
nombre: ToleranciasController
nivel: L2
dominio: asistencia
resumen: Superficie HTTP de tolerancias bajo /api/v1/operaciones/tolerancias.
prefijo: /api/v1/operaciones/tolerancias
capa: backend
permisos: [asistencia:asistencia_ver, asistencia:asistencia_editar]
archivos:
  - backend/src/modules/operaciones/tolerancias.controller.ts
edges:
  - [belongs_to, domain--asistencia]
  - [exposes, service--operaciones-tolerancias]
terminos: [tolerancias, operaciones, asistencia, ver, editar]
---

# ToleranciasController

Superficie HTTP de tolerancias bajo /api/v1/operaciones/tolerancias.

- **Prefijo:** `/api/v1/operaciones/tolerancias`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/operaciones/tolerancias` | `asistencia:asistencia_ver` |
| POST | `/operaciones/tolerancias` | `asistencia:asistencia_editar` |
| PATCH | `/operaciones/tolerancias/:id` | `asistencia:asistencia_editar` |

## Archivos

- `backend/src/modules/operaciones/tolerancias.controller.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `exposes` → [[service--operaciones-tolerancias|ToleranciasService]]

## Referenciado por

- [[component--front-asistencia|asistencia]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
