---
id: api--documentos-consultas-documentos
tipo: API
nombre: ConsultasDocumentosController
nivel: L2
dominio: documentos
resumen: Superficie HTTP de consultas documentos bajo /api/v1/documentos/consultas.
prefijo: /api/v1/documentos/consultas
capa: backend
permisos: [documentos:ver]
archivos:
  - backend/src/modules/documentos/consultas-documentos.controller.ts
edges:
  - [belongs_to, domain--documentos]
  - [exposes, service--documentos-consultas-documentos]
terminos: [consultas, documentos, ver]
---

# ConsultasDocumentosController

Superficie HTTP de consultas documentos bajo /api/v1/documentos/consultas.

- **Prefijo:** `/api/v1/documentos/consultas`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/documentos/consultas/buscar` | `documentos:ver` |
| GET | `/documentos/consultas/proximos-a-vencer` | `documentos:ver` |

## Archivos

- `backend/src/modules/documentos/consultas-documentos.controller.ts`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]
- `exposes` → [[service--documentos-consultas-documentos|ConsultasDocumentosService]]

## Referenciado por

- [[component--front-documentos|documentos]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
