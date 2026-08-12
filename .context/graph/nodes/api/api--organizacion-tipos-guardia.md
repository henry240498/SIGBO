---
id: api--organizacion-tipos-guardia
tipo: API
nombre: TiposGuardiaController
nivel: L2
dominio: organizacion
resumen: Superficie HTTP de tipos guardia bajo /api/v1/organizacion/tipos-guardia.
prefijo: /api/v1/organizacion/tipos-guardia
capa: backend
permisos: [organizacion:tipos_guardia_ver, organizacion:tipos_guardia_crear, organizacion:tipos_guardia_editar, organizacion:tipos_guardia_eliminar]
archivos:
  - backend/src/modules/organizacion/tipos-guardia.controller.ts
edges:
  - [belongs_to, domain--organizacion]
  - [exposes, service--organizacion-tipos-guardia]
terminos: [tipos, guardia, organizacion, ver, crear, editar, eliminar]
---

# TiposGuardiaController

Superficie HTTP de tipos guardia bajo /api/v1/organizacion/tipos-guardia.

- **Prefijo:** `/api/v1/organizacion/tipos-guardia`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/organizacion/tipos-guardia` | `organizacion:tipos_guardia_ver` |
| GET | `/organizacion/tipos-guardia/exportar/excel` | `organizacion:tipos_guardia_ver` |
| GET | `/organizacion/tipos-guardia/exportar/pdf` | `organizacion:tipos_guardia_ver` |
| GET | `/organizacion/tipos-guardia/:id` | `organizacion:tipos_guardia_ver` |
| POST | `/organizacion/tipos-guardia` | `organizacion:tipos_guardia_crear` |
| PATCH | `/organizacion/tipos-guardia/:id` | `organizacion:tipos_guardia_editar` |
| PATCH | `/organizacion/tipos-guardia/:id/baja` | `organizacion:tipos_guardia_eliminar` |
| PATCH | `/organizacion/tipos-guardia/:id/reactivar` | `organizacion:tipos_guardia_eliminar` |

## Archivos

- `backend/src/modules/organizacion/tipos-guardia.controller.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `exposes` → [[service--organizacion-tipos-guardia|TiposGuardiaService]]

## Referenciado por

- [[screen--dashboard-organizacion-guardias|/dashboard/organizacion/guardias]] `calls` →
- [[screen--dashboard-organizacion-guardias|/dashboard/organizacion/guardias]] `calls` →
- [[screen--dashboard-organizacion-guardias|/dashboard/organizacion/guardias]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
