---
id: api--operaciones-importaciones
tipo: API
nombre: ImportacionesController
nivel: L2
dominio: asistencia
resumen: Superficie HTTP de importaciones bajo /api/v1/operaciones/importaciones.
prefijo: /api/v1/operaciones/importaciones
capa: backend
permisos: [asistencia:importar_marcador]
archivos:
  - backend/src/modules/operaciones/importaciones.controller.ts
edges:
  - [belongs_to, domain--asistencia]
  - [exposes, service--operaciones-importaciones]
terminos: [importaciones, operaciones, asistencia, importar, marcador]
---

# ImportacionesController

Superficie HTTP de importaciones bajo /api/v1/operaciones/importaciones.

- **Prefijo:** `/api/v1/operaciones/importaciones`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/operaciones/importaciones` | `asistencia:importar_marcador` |
| GET | `/operaciones/importaciones/:id` | `asistencia:importar_marcador` |
| GET | `/operaciones/importaciones/:id/filas` | `asistencia:importar_marcador` |
| POST | `/operaciones/importaciones/:id/confirmar` | `asistencia:importar_marcador` |
| POST | `/operaciones/importaciones/:id/cancelar` | `asistencia:importar_marcador` |

## Archivos

- `backend/src/modules/operaciones/importaciones.controller.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `exposes` → [[service--operaciones-importaciones|ImportacionesService]]

## Referenciado por

- [[component--front-asistencia|asistencia]] `calls` →
- [[component--front-asistencia|asistencia]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
