---
id: api--organizacion-ascensos
tipo: API
nombre: AscensosController
nivel: L2
dominio: organizacion
resumen: Superficie HTTP de ascensos bajo /api/v1/organizacion/ascensos.
prefijo: /api/v1/organizacion/ascensos
capa: backend
permisos: [organizacion:ascensos_ver, organizacion:ascensos_crear, organizacion:ascensos_anular]
archivos:
  - backend/src/modules/organizacion/ascensos.controller.ts
edges:
  - [belongs_to, domain--organizacion]
  - [exposes, service--organizacion-ascensos]
terminos: [ascensos, organizacion, ver, crear, anular]
---

# AscensosController

Superficie HTTP de ascensos bajo /api/v1/organizacion/ascensos.

- **Prefijo:** `/api/v1/organizacion/ascensos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/organizacion/ascensos` | `organizacion:ascensos_ver` |
| GET | `/organizacion/ascensos/exportar/excel` | `organizacion:ascensos_ver` |
| GET | `/organizacion/ascensos/exportar/pdf` | `organizacion:ascensos_ver` |
| GET | `/organizacion/ascensos/:id` | `organizacion:ascensos_ver` |
| POST | `/organizacion/ascensos` | `organizacion:ascensos_crear` |
| PATCH | `/organizacion/ascensos/:id/anular` | `organizacion:ascensos_anular` |

## Archivos

- `backend/src/modules/organizacion/ascensos.controller.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `exposes` → [[service--organizacion-ascensos|AscensosService]]

## Referenciado por

- [[screen--dashboard-organizacion-ascensos|/dashboard/organizacion/ascensos]] `calls` →
- [[screen--dashboard-organizacion-ascensos|/dashboard/organizacion/ascensos]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
