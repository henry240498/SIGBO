---
id: api--organizacion-feriados
tipo: API
nombre: FeriadosController
nivel: L2
dominio: organizacion
resumen: Superficie HTTP de feriados bajo /api/v1/organizacion/feriados.
prefijo: /api/v1/organizacion/feriados
capa: backend
permisos: [organizacion:feriados_ver, organizacion:feriados_crear, organizacion:feriados_editar, organizacion:feriados_eliminar]
archivos:
  - backend/src/modules/organizacion/feriados.controller.ts
edges:
  - [belongs_to, domain--organizacion]
  - [exposes, service--organizacion-feriados]
terminos: [feriados, organizacion, ver, crear, editar, eliminar]
---

# FeriadosController

Superficie HTTP de feriados bajo /api/v1/organizacion/feriados.

- **Prefijo:** `/api/v1/organizacion/feriados`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/organizacion/feriados` | `organizacion:feriados_ver` |
| GET | `/organizacion/feriados/:id` | `organizacion:feriados_ver` |
| POST | `/organizacion/feriados` | `organizacion:feriados_crear` |
| PATCH | `/organizacion/feriados/:id` | `organizacion:feriados_editar` |
| POST | `/organizacion/feriados/:id/mover` | `organizacion:feriados_editar` |
| DELETE | `/organizacion/feriados/:id` | `organizacion:feriados_eliminar` |

## Archivos

- `backend/src/modules/organizacion/feriados.controller.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `exposes` → [[service--organizacion-feriados|FeriadosService]]

## Referenciado por

- [[component--front-guardias|guardias]] `calls` →
- [[component--front-guardias|guardias]] `calls` →
- [[component--front-guardias|guardias]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
