---
id: api--centro-mando-centro-mando
tipo: API
nombre: CentroMandoController
nivel: L2
dominio: seguridad
resumen: "Accesible para cualquier usuario autenticado, como GET /seguridad/mi-inicio: el estado del bombero, el permiso base de cada seccion y la matriz deciden que se devuelve."
prefijo: /api/v1/centro-mando
capa: backend
archivos:
  - backend/src/modules/centro-mando/centro-mando.controller.ts
edges:
  - [belongs_to, domain--seguridad]
  - [exposes, service--centro-mando-centro-mando]
terminos: [centro, mando]
---

# CentroMandoController

Accesible para cualquier usuario autenticado, como GET /seguridad/mi-inicio: el estado del bombero, el permiso base de cada seccion y la matriz deciden que se devuelve.

- **Prefijo:** `/api/v1/centro-mando`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/centro-mando` | — |
| GET | `/centro-mando/acceso` | — |

## Archivos

- `backend/src/modules/centro-mando/centro-mando.controller.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `exposes` → [[service--centro-mando-centro-mando|CentroMandoService]]

## Referenciado por

- [[screen--dashboard-centro-mando|/dashboard/centro-mando]] `calls` →
- [[component--front-permisospantallaprovider|PermisosPantallaProvider]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
