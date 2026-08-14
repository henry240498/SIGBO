---
id: api--guardias-sorteos
tipo: API
nombre: SorteosController
nivel: L2
dominio: guardias
resumen: Superficie HTTP de sorteos bajo /api/v1/guardias/sorteos.
prefijo: /api/v1/guardias/sorteos
capa: backend
permisos: [guardias:sorteos, guardias:crear]
archivos:
  - backend/src/modules/guardias/sorteos.controller.ts
edges:
  - [belongs_to, domain--guardias]
  - [exposes, service--guardias-sorteos]
terminos: [sorteos, guardias, crear]
---

# SorteosController

Superficie HTTP de sorteos bajo /api/v1/guardias/sorteos.

- **Prefijo:** `/api/v1/guardias/sorteos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/guardias/sorteos` | `guardias:sorteos` |
| GET | `/guardias/sorteos/:id` | `guardias:sorteos` |
| POST | `/guardias/sorteos` | `guardias:sorteos` |
| POST | `/guardias/sorteos/:id/crear-guardia` | `guardias:crear` |

## Archivos

- `backend/src/modules/guardias/sorteos.controller.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `exposes` → [[service--guardias-sorteos|SorteosService]]

## Referenciado por

- [[component--front-guardias|guardias]] `calls` →
- [[component--front-guardias|guardias]] `calls` →
- [[component--front-guardias|guardias]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
