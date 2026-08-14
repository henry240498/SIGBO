---
id: api--denuncias-denuncias
tipo: API
nombre: DenunciasController
nivel: L2
dominio: denuncias
resumen: Superficie HTTP de denuncias bajo /api/v1/denuncias.
prefijo: /api/v1/denuncias
capa: backend
permisos: [denuncias:ver, denuncias:asignar, denuncias:configurar_categorias]
archivos:
  - backend/src/modules/denuncias/denuncias.controller.ts
edges:
  - [belongs_to, domain--denuncias]
  - [exposes, service--denuncias-denuncias]
terminos: [denuncias, ver, asignar, configurar, categorias]
---

# DenunciasController

Superficie HTTP de denuncias bajo /api/v1/denuncias.

- **Prefijo:** `/api/v1/denuncias`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/denuncias` | `denuncias:ver` |
| GET | `/denuncias/resumen` | `denuncias:ver` |
| GET | `/denuncias/asignables` | `denuncias:asignar` |
| GET | `/denuncias/categorias` | `denuncias:configurar_categorias` |
| POST | `/denuncias/categorias` | `denuncias:configurar_categorias` |
| PATCH | `/denuncias/categorias/:id` | `denuncias:configurar_categorias` |
| GET | `/denuncias/:id` | `denuncias:ver` |
| POST | `/denuncias/:id/asignar` | `denuncias:asignar` |

## Archivos

- `backend/src/modules/denuncias/denuncias.controller.ts`

## Relaciones

- `belongs_to` → [[domain--denuncias|Denuncias]]
- `exposes` → [[service--denuncias-denuncias|DenunciasService]]

## Referenciado por

- [[screen--dashboard-denuncias|/dashboard/denuncias]] `calls` →
- [[screen--dashboard-denuncias|/dashboard/denuncias]] `calls` →
- [[screen--dashboard-denuncias-id|/dashboard/denuncias/[id]]] `calls` →
- [[screen--dashboard-denuncias-id|/dashboard/denuncias/[id]]] `calls` →
- [[rule--datos-tecnicos-de-denuncia-restringidos|La IP, el GPS y el user agent de una denuncia exigen un permiso aparte]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
