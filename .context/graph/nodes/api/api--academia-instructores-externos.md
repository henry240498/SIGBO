---
id: api--academia-instructores-externos
tipo: API
nombre: InstructoresExternosController
nivel: L2
dominio: academia
resumen: Superficie HTTP de instructores externos bajo /api/v1/academia/instructores-externos.
prefijo: /api/v1/academia/instructores-externos
capa: backend
permisos: [academia:ver, academia:gestionar_instructores]
archivos:
  - backend/src/modules/academia/instructores-externos.controller.ts
edges:
  - [belongs_to, domain--academia]
  - [exposes, service--academia-instructores-externos]
terminos: [instructores, externos, academia, ver, gestionar]
---

# InstructoresExternosController

Superficie HTTP de instructores externos bajo /api/v1/academia/instructores-externos.

- **Prefijo:** `/api/v1/academia/instructores-externos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/academia/instructores-externos` | `academia:ver` |
| GET | `/academia/instructores-externos/:id` | `academia:ver` |
| POST | `/academia/instructores-externos` | `academia:gestionar_instructores` |
| PATCH | `/academia/instructores-externos/:id` | `academia:gestionar_instructores` |

## Archivos

- `backend/src/modules/academia/instructores-externos.controller.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `exposes` → [[service--academia-instructores-externos|InstructoresExternosService]]

## Referenciado por

- [[component--front-academia|academia]] `calls` →
- [[component--front-academia|academia]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
