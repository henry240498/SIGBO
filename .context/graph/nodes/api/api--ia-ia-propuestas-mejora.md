---
id: api--ia-ia-propuestas-mejora
tipo: API
nombre: IaPropuestasMejoraController
nivel: L2
dominio: inteligencia
resumen: Superficie HTTP de ia propuestas mejora bajo /api/v1/ia/admin/propuestas.
prefijo: /api/v1/ia/admin/propuestas
capa: backend
permisos: [inteligencia:gestionar_mejoras]
archivos:
  - backend/src/modules/ia/ia-propuestas-mejora.controller.ts
edges:
  - [belongs_to, domain--inteligencia]
  - [exposes, service--ia-ia-propuestas-mejora]
terminos: [propuestas, mejora, admin, inteligencia, gestionar, mejoras]
---

# IaPropuestasMejoraController

Superficie HTTP de ia propuestas mejora bajo /api/v1/ia/admin/propuestas.

- **Prefijo:** `/api/v1/ia/admin/propuestas`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/ia/admin/propuestas` | `inteligencia:gestionar_mejoras` |
| GET | `/ia/admin/propuestas/:id` | `inteligencia:gestionar_mejoras` |
| POST | `/ia/admin/propuestas` | `inteligencia:gestionar_mejoras` |
| POST | `/ia/admin/propuestas/:id/enviar-revision` | `inteligencia:gestionar_mejoras` |
| POST | `/ia/admin/propuestas/:id/aprobar` | `inteligencia:gestionar_mejoras` |
| POST | `/ia/admin/propuestas/:id/rechazar` | `inteligencia:gestionar_mejoras` |
| POST | `/ia/admin/propuestas/:id/publicar` | `inteligencia:gestionar_mejoras` |

## Archivos

- `backend/src/modules/ia/ia-propuestas-mejora.controller.ts`

## Relaciones

- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `exposes` → [[service--ia-ia-propuestas-mejora|IaPropuestasMejoraService]]

## Referenciado por

- [[component--front-ia|ia]] `calls` →
- [[component--front-ia|ia]] `calls` →
- [[component--front-ia|ia]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
