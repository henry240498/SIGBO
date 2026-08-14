---
id: api--organizacion-parametros
tipo: API
nombre: ParametrosController
nivel: L2
dominio: organizacion
resumen: Superficie HTTP de parametros bajo /api/v1/organizacion/parametros.
prefijo: /api/v1/organizacion/parametros
capa: backend
permisos: [organizacion:parametros_ver, organizacion:parametros_crear, organizacion:parametros_editar, organizacion:parametros_eliminar]
archivos:
  - backend/src/modules/organizacion/parametros.controller.ts
edges:
  - [belongs_to, domain--organizacion]
  - [exposes, service--organizacion-parametros]
terminos: [parametros, organizacion, ver, crear, editar, eliminar]
---

# ParametrosController

Superficie HTTP de parametros bajo /api/v1/organizacion/parametros.

- **Prefijo:** `/api/v1/organizacion/parametros`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/organizacion/parametros` | `organizacion:parametros_ver` |
| GET | `/organizacion/parametros/exportar/excel` | `organizacion:parametros_ver` |
| GET | `/organizacion/parametros/exportar/pdf` | `organizacion:parametros_ver` |
| GET | `/organizacion/parametros/:id` | `organizacion:parametros_ver` |
| POST | `/organizacion/parametros` | `organizacion:parametros_crear` |
| PATCH | `/organizacion/parametros/:id` | `organizacion:parametros_editar` |
| PATCH | `/organizacion/parametros/:id/baja` | `organizacion:parametros_eliminar` |
| PATCH | `/organizacion/parametros/:id/reactivar` | `organizacion:parametros_eliminar` |

## Archivos

- `backend/src/modules/organizacion/parametros.controller.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `exposes` → [[service--organizacion-parametros|ParametrosService]]

## Referenciado por

- [[screen--dashboard-organizacion-parametros|/dashboard/organizacion/parametros]] `calls` →
- [[screen--dashboard-organizacion-parametros|/dashboard/organizacion/parametros]] `calls` →
- [[screen--dashboard-organizacion-parametros|/dashboard/organizacion/parametros]] `calls` →
- [[component--front-parametros|parametros]] `calls` →
- [[component--front-parametros|parametros]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
