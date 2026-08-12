---
id: api--organizacion-departamentos
tipo: API
nombre: DepartamentosController
nivel: L2
dominio: organizacion
resumen: Superficie HTTP de departamentos bajo /api/v1/organizacion/departamentos.
prefijo: /api/v1/organizacion/departamentos
capa: backend
permisos: [organizacion:departamentos_ver, organizacion:departamentos_crear, organizacion:departamentos_editar, organizacion:departamentos_eliminar]
archivos:
  - backend/src/modules/organizacion/departamentos.controller.ts
edges:
  - [belongs_to, domain--organizacion]
  - [exposes, service--organizacion-departamentos]
terminos: [departamentos, organizacion, ver, crear, editar, eliminar]
---

# DepartamentosController

Superficie HTTP de departamentos bajo /api/v1/organizacion/departamentos.

- **Prefijo:** `/api/v1/organizacion/departamentos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/organizacion/departamentos` | `organizacion:departamentos_ver` |
| GET | `/organizacion/departamentos/exportar/excel` | `organizacion:departamentos_ver` |
| GET | `/organizacion/departamentos/exportar/pdf` | `organizacion:departamentos_ver` |
| GET | `/organizacion/departamentos/:id` | `organizacion:departamentos_ver` |
| POST | `/organizacion/departamentos` | `organizacion:departamentos_crear` |
| PATCH | `/organizacion/departamentos/:id` | `organizacion:departamentos_editar` |
| PATCH | `/organizacion/departamentos/:id/baja` | `organizacion:departamentos_eliminar` |
| PATCH | `/organizacion/departamentos/:id/reactivar` | `organizacion:departamentos_eliminar` |

## Archivos

- `backend/src/modules/organizacion/departamentos.controller.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `exposes` → [[service--organizacion-departamentos|DepartamentosService]]

## Referenciado por

- [[screen--dashboard-organizacion-departamentos|/dashboard/organizacion/departamentos]] `calls` →
- [[screen--dashboard-organizacion-departamentos|/dashboard/organizacion/departamentos]] `calls` →
- [[screen--dashboard-organizacion-departamentos|/dashboard/organizacion/departamentos]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
