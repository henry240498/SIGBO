---
id: api--academia-cursos-externos
tipo: API
nombre: CursosExternosController
nivel: L2
dominio: academia
resumen: Superficie HTTP de cursos externos bajo /api/v1/academia/cursos-externos.
prefijo: /api/v1/academia/cursos-externos
capa: backend
permisos: [academia:ver, academia:configurar]
archivos:
  - backend/src/modules/academia/cursos-externos.controller.ts
edges:
  - [belongs_to, domain--academia]
  - [exposes, service--academia-cursos-externos]
terminos: [cursos, externos, academia, ver, configurar]
---

# CursosExternosController

Superficie HTTP de cursos externos bajo /api/v1/academia/cursos-externos.

- **Prefijo:** `/api/v1/academia/cursos-externos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/academia/cursos-externos` | `academia:ver` |
| POST | `/academia/cursos-externos/refrescar` | `academia:configurar` |

## Archivos

- `backend/src/modules/academia/cursos-externos.controller.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `exposes` → [[service--academia-cursos-externos|CursosExternosService]]

## Referenciado por

- [[component--front-academia|academia]] `calls` →
- [[component--front-academia|academia]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
