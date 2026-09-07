---
id: api--documentos-firmas-documento
tipo: API
nombre: FirmasDocumentoController
nivel: L2
dominio: documentos
resumen: Superficie HTTP de firmas documento bajo /api/v1/documentos.
prefijo: /api/v1/documentos
capa: backend
permisos: [documentos:ver, documentos:administrar, documentos:firmar]
archivos:
  - backend/src/modules/documentos/firmas-documento.controller.ts
edges:
  - [belongs_to, domain--documentos]
  - [exposes, service--documentos-firmas-documento]
terminos: [firmas, documento, documentos, ver, administrar, firmar]
---

# FirmasDocumentoController

Superficie HTTP de firmas documento bajo /api/v1/documentos.

- **Prefijo:** `/api/v1/documentos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/documentos/:documentoId/firmas` | `documentos:ver` |
| POST | `/documentos/:documentoId/firmas` | `documentos:administrar` |
| POST | `/documentos/firmas/:firmaId/firmar` | `documentos:firmar` |
| POST | `/documentos/firmas/:firmaId/confirmar-manual` | `documentos:firmar` |

## Archivos

- `backend/src/modules/documentos/firmas-documento.controller.ts`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]
- `exposes` → [[service--documentos-firmas-documento|FirmasDocumentoService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
