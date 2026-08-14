---
id: api--guardias-ordenes-guardia
tipo: API
nombre: OrdenesGuardiaController
nivel: L2
dominio: guardias
resumen: Superficie HTTP de ordenes guardia bajo /api/v1/guardias/ordenes.
prefijo: /api/v1/guardias/ordenes
capa: backend
permisos: [guardias:ordenes_ver, guardias:ordenes_configurar, guardias:ordenes_crear, guardias:ordenes_editar, guardias:ordenes_aprobar, guardias:ordenes_publicar, guardias:ordenes_anular]
archivos:
  - backend/src/modules/guardias/ordenes-guardia.controller.ts
edges:
  - [belongs_to, domain--guardias]
  - [exposes, service--guardias-ordenes-guardia]
  - [exposes, service--guardias-orden-guardia-configuracion]
terminos: [ordenes, guardia, guardias, ver, configurar, crear, editar, aprobar, publicar, anular]
---

# OrdenesGuardiaController

Superficie HTTP de ordenes guardia bajo /api/v1/guardias/ordenes.

- **Prefijo:** `/api/v1/guardias/ordenes`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/guardias/ordenes` | `guardias:ordenes_ver` |
| GET | `/guardias/ordenes/configuracion` | `guardias:ordenes_ver` |
| PUT | `/guardias/ordenes/configuracion` | `guardias:ordenes_configurar` |
| POST | `/guardias/ordenes` | `guardias:ordenes_crear` |
| GET | `/guardias/ordenes/`:id(${GUID_PATH}` | `guardias:ordenes_ver` |
| POST | `/guardias/ordenes/`:id(${GUID_PATH}` | `guardias:ordenes_editar` |
| POST | `/guardias/ordenes/`:id(${GUID_PATH}` | `guardias:ordenes_editar` |
| POST | `/guardias/ordenes/`:id(${GUID_PATH}` | `guardias:ordenes_editar` |
| POST | `/guardias/ordenes/`:id(${GUID_PATH}` | `guardias:ordenes_editar` |
| POST | `/guardias/ordenes/`:id(${GUID_PATH}` | `guardias:ordenes_aprobar` |
| POST | `/guardias/ordenes/`:id(${GUID_PATH}` | `guardias:ordenes_publicar` |
| POST | `/guardias/ordenes/`:id(${GUID_PATH}` | `guardias:ordenes_anular` |
| GET | `/guardias/ordenes/`:id(${GUID_PATH}` | `guardias:ordenes_ver` |
| POST | `/guardias/ordenes/`:id(${GUID_PATH}` | `guardias:ordenes_editar` |

## Archivos

- `backend/src/modules/guardias/ordenes-guardia.controller.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `exposes` → [[service--guardias-ordenes-guardia|OrdenesGuardiaService]]
- `exposes` → [[service--guardias-orden-guardia-configuracion|OrdenGuardiaConfiguracionService]]

## Referenciado por

- [[component--front-guardias|guardias]] `calls` →
- [[component--front-guardias|guardias]] `calls` →
- [[component--front-guardias|guardias]] `calls` →
- [[component--front-guardias|guardias]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
