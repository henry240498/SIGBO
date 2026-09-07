---
id: api--documentos-dashboard-documentos
tipo: API
nombre: DashboardDocumentosController
nivel: L2
dominio: documentos
resumen: Superficie HTTP de dashboard documentos bajo /api/v1/documentos/dashboard.
prefijo: /api/v1/documentos/dashboard
capa: backend
permisos: [documentos:ver]
archivos:
  - backend/src/modules/documentos/dashboard-documentos.controller.ts
edges:
  - [belongs_to, domain--documentos]
  - [exposes, service--documentos-dashboard-documentos]
terminos: [documentos, ver]
---

# DashboardDocumentosController

Superficie HTTP de dashboard documentos bajo /api/v1/documentos/dashboard.

- **Prefijo:** `/api/v1/documentos/dashboard`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/documentos/dashboard` | `documentos:ver` |

## Archivos

- `backend/src/modules/documentos/dashboard-documentos.controller.ts`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]
- `exposes` → [[service--documentos-dashboard-documentos|DashboardDocumentosService]]

## Referenciado por

- [[component--front-documentos|documentos]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
