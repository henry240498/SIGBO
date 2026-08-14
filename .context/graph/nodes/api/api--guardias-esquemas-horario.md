---
id: api--guardias-esquemas-horario
tipo: API
nombre: EsquemasHorarioController
nivel: L2
dominio: guardias
resumen: Superficie HTTP de esquemas horario bajo /api/v1/guardias/esquemas-horario.
prefijo: /api/v1/guardias/esquemas-horario
capa: backend
permisos: [guardias:ver, guardias:requisitos]
archivos:
  - backend/src/modules/guardias/esquemas-horario.controller.ts
edges:
  - [belongs_to, domain--guardias]
  - [exposes, service--guardias-esquemas-horario]
terminos: [esquemas, horario, guardias, ver, requisitos]
---

# EsquemasHorarioController

Superficie HTTP de esquemas horario bajo /api/v1/guardias/esquemas-horario.

- **Prefijo:** `/api/v1/guardias/esquemas-horario`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/guardias/esquemas-horario` | `guardias:ver` |
| GET | `/guardias/esquemas-horario/:id` | `guardias:ver` |
| POST | `/guardias/esquemas-horario` | `guardias:requisitos` |
| PATCH | `/guardias/esquemas-horario/:id` | `guardias:requisitos` |
| DELETE | `/guardias/esquemas-horario/:id` | `guardias:requisitos` |

## Archivos

- `backend/src/modules/guardias/esquemas-horario.controller.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `exposes` → [[service--guardias-esquemas-horario|EsquemasHorarioService]]

## Referenciado por

- [[component--front-guardias|guardias]] `calls` →
- [[component--front-guardias|guardias]] `calls` →
- [[component--front-guardias|guardias]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
