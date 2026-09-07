---
id: api--documentos-expedientes
tipo: API
nombre: ExpedientesController
nivel: L2
dominio: documentos
resumen: Superficie HTTP de expedientes bajo /api/v1/documentos/expedientes.
prefijo: /api/v1/documentos/expedientes
capa: backend
permisos: [documentos:ver, documentos:crear, documentos:editar]
archivos:
  - backend/src/modules/documentos/expedientes.controller.ts
edges:
  - [belongs_to, domain--documentos]
  - [exposes, service--documentos-expedientes]
terminos: [expedientes, documentos, ver, crear, editar]
---

# ExpedientesController

Superficie HTTP de expedientes bajo /api/v1/documentos/expedientes.

- **Prefijo:** `/api/v1/documentos/expedientes`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/documentos/expedientes` | `documentos:ver` |
| GET | `/documentos/expedientes/:id` | `documentos:ver` |
| GET | `/documentos/expedientes/:id/documentos` | `documentos:ver` |
| POST | `/documentos/expedientes` | `documentos:crear` |
| PATCH | `/documentos/expedientes/:id` | `documentos:editar` |

## Archivos

- `backend/src/modules/documentos/expedientes.controller.ts`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]
- `exposes` → [[service--documentos-expedientes|ExpedientesService]]

## Referenciado por

- [[component--front-documentos|documentos]] `calls` →
- [[component--front-documentos|documentos]] `calls` →
- [[component--front-documentos|documentos]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
