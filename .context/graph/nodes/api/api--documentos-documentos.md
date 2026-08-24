---
id: api--documentos-documentos
tipo: API
nombre: DocumentosController
nivel: L2
dominio: documentos
resumen: Superficie HTTP de documentos bajo /api/v1/documentos.
prefijo: /api/v1/documentos
capa: backend
permisos: [organizacion:documentos_configurar, documentos:crear, documentos:ver, documentos:ver_auditoria, documentos:editar, documentos:aprobar, documentos:anular, documentos:administrar, documentos:eliminar]
archivos:
  - backend/src/modules/documentos/documentos.controller.ts
edges:
  - [belongs_to, domain--documentos]
  - [exposes, service--documentos-documentos]
  - [exposes, service--seguridad-auditoria]
terminos: [documentos, organizacion, configurar, crear, ver, auditoria, editar, aprobar, anular, administrar, eliminar]
---

# DocumentosController

Superficie HTTP de documentos bajo /api/v1/documentos.

- **Prefijo:** `/api/v1/documentos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/documentos/numeraciones` | `organizacion:documentos_configurar` |
| GET | `/documentos/numeraciones/:tipoDocumentoId/siguiente` | `documentos:crear` |
| GET | `/documentos/:id` | `documentos:ver` |
| GET | `/documentos/:id/versiones` | `documentos:ver` |
| GET | `/documentos/:id/relaciones` | `documentos:ver` |
| GET | `/documentos/:id/auditoria` | `documentos:ver_auditoria` |
| POST | `/documentos` | `documentos:crear` |
| PATCH | `/documentos/:id` | `documentos:editar` |
| PATCH | `/documentos/:id/estado` | `documentos:editar` |
| POST | `/documentos/:id/aprobar` | `documentos:aprobar` |
| POST | `/documentos/:id/publicar` | `documentos:aprobar` |
| POST | `/documentos/:id/anular` | `documentos:anular` |
| POST | `/documentos/:id/archivar` | `documentos:editar` |
| POST | `/documentos/:id/reabrir` | `documentos:administrar` |
| DELETE | `/documentos/:id` | `documentos:eliminar` |
| POST | `/documentos/:id/relaciones` | `documentos:editar` |
| DELETE | `/documentos/relaciones/:relacionId` | `documentos:editar` |

## Archivos

- `backend/src/modules/documentos/documentos.controller.ts`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]
- `exposes` → [[service--documentos-documentos|DocumentosService]]
- `exposes` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[component--front-documentos|documentos]] `calls` →
- [[component--front-documentos|documentos]] `calls` →
- [[component--front-documentos|documentos]] `calls` →
- [[component--front-documentos|documentos]] `calls` →
- [[component--front-documentos|documentos]] `calls` →
- [[component--front-documentos|documentos]] `calls` →
- [[component--front-documentos|documentos]] `calls` →
- [[component--front-documentos|documentos]] `calls` →
- [[component--front-documentos|documentos]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
