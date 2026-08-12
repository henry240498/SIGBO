---
id: api--organizacion-brigadas
tipo: API
nombre: BrigadasController
nivel: L2
dominio: organizacion
resumen: Superficie HTTP de brigadas bajo /api/v1/organizacion/brigadas.
prefijo: /api/v1/organizacion/brigadas
capa: backend
permisos: [organizacion:brigadas_ver, organizacion:brigadas_crear, organizacion:brigadas_editar, organizacion:brigadas_eliminar]
archivos:
  - backend/src/modules/organizacion/brigadas.controller.ts
edges:
  - [belongs_to, domain--organizacion]
  - [exposes, service--organizacion-brigadas]
terminos: [brigadas, organizacion, ver, crear, editar, eliminar]
---

# BrigadasController

Superficie HTTP de brigadas bajo /api/v1/organizacion/brigadas.

- **Prefijo:** `/api/v1/organizacion/brigadas`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/organizacion/brigadas` | `organizacion:brigadas_ver` |
| GET | `/organizacion/brigadas/exportar/excel` | `organizacion:brigadas_ver` |
| GET | `/organizacion/brigadas/exportar/pdf` | `organizacion:brigadas_ver` |
| GET | `/organizacion/brigadas/:id` | `organizacion:brigadas_ver` |
| POST | `/organizacion/brigadas` | `organizacion:brigadas_crear` |
| PATCH | `/organizacion/brigadas/:id` | `organizacion:brigadas_editar` |
| PATCH | `/organizacion/brigadas/:id/baja` | `organizacion:brigadas_eliminar` |
| PATCH | `/organizacion/brigadas/:id/reactivar` | `organizacion:brigadas_eliminar` |

## Archivos

- `backend/src/modules/organizacion/brigadas.controller.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `exposes` → [[service--organizacion-brigadas|BrigadasService]]

## Referenciado por

- [[screen--dashboard-organizacion-brigadas|/dashboard/organizacion/brigadas]] `calls` →
- [[screen--dashboard-organizacion-brigadas|/dashboard/organizacion/brigadas]] `calls` →
- [[screen--dashboard-organizacion-unidades|/dashboard/organizacion/unidades]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
