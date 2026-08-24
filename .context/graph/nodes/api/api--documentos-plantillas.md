---
id: api--documentos-plantillas
tipo: API
nombre: PlantillasController
nivel: L2
dominio: documentos
resumen: Superficie HTTP de plantillas bajo /api/v1/documentos/plantillas.
prefijo: /api/v1/documentos/plantillas
capa: backend
permisos: [documentos:ver, documentos:administrar, documentos:crear]
archivos:
  - backend/src/modules/documentos/plantillas.controller.ts
edges:
  - [belongs_to, domain--documentos]
  - [exposes, service--documentos-plantillas]
terminos: [plantillas, documentos, ver, administrar, crear]
---

# PlantillasController

Superficie HTTP de plantillas bajo /api/v1/documentos/plantillas.

- **Prefijo:** `/api/v1/documentos/plantillas`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/documentos/plantillas` | `documentos:ver` |
| GET | `/documentos/plantillas/:id` | `documentos:ver` |
| POST | `/documentos/plantillas` | `documentos:administrar` |
| PATCH | `/documentos/plantillas/:id` | `documentos:administrar` |
| POST | `/documentos/plantillas/:id/generar` | `documentos:crear` |

## Archivos

- `backend/src/modules/documentos/plantillas.controller.ts`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]
- `exposes` → [[service--documentos-plantillas|PlantillasService]]

## Referenciado por

- [[component--front-documentos|documentos]] `calls` →
- [[component--front-documentos|documentos]] `calls` →
- [[component--front-documentos|documentos]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
