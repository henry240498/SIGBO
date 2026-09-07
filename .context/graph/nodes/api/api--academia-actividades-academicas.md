---
id: api--academia-actividades-academicas
tipo: API
nombre: ActividadesAcademicasController
nivel: L2
dominio: academia
resumen: Superficie HTTP de actividades academicas bajo /api/v1/academia/actividades.
prefijo: /api/v1/academia/actividades
capa: backend
permisos: [academia:ver, academia:crear_curso, academia:editar_curso, academia:gestionar_instructores]
archivos:
  - backend/src/modules/academia/actividades-academicas.controller.ts
edges:
  - [belongs_to, domain--academia]
  - [exposes, service--academia-actividades-academicas]
terminos: [actividades, academicas, academia, ver, crear, curso, editar, gestionar, instructores]
---

# ActividadesAcademicasController

Superficie HTTP de actividades academicas bajo /api/v1/academia/actividades.

- **Prefijo:** `/api/v1/academia/actividades`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/academia/actividades` | `academia:ver` |
| GET | `/academia/actividades/:id` | `academia:ver` |
| POST | `/academia/actividades` | `academia:crear_curso` |
| PATCH | `/academia/actividades/:id` | `academia:editar_curso` |
| GET | `/academia/actividades/:id/instructores` | `academia:ver` |
| POST | `/academia/actividades/:id/instructores` | `academia:gestionar_instructores` |
| DELETE | `/academia/actividades/:id/instructores/:instructorId` | `academia:gestionar_instructores` |

## Archivos

- `backend/src/modules/academia/actividades-academicas.controller.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `exposes` → [[service--academia-actividades-academicas|ActividadesAcademicasService]]

## Referenciado por

- [[component--front-academia|academia]] `calls` →
- [[component--front-academia|academia]] `calls` →
- [[component--front-academia|academia]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
