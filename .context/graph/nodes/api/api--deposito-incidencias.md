---
id: api--deposito-incidencias
tipo: API
nombre: IncidenciasController
nivel: L2
dominio: deposito
resumen: Superficie HTTP de incidencias bajo /api/v1/deposito/incidencias.
prefijo: /api/v1/deposito/incidencias
capa: backend
permisos: [deposito:ver, deposito:crear, deposito:editar]
archivos:
  - backend/src/modules/deposito/incidencias.controller.ts
edges:
  - [belongs_to, domain--deposito]
  - [exposes, service--deposito-incidencias]
terminos: [incidencias, deposito, ver, crear, editar]
---

# IncidenciasController

Superficie HTTP de incidencias bajo /api/v1/deposito/incidencias.

- **Prefijo:** `/api/v1/deposito/incidencias`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/deposito/incidencias` | `deposito:ver` |
| GET | `/deposito/incidencias/:id` | `deposito:ver` |
| POST | `/deposito/incidencias` | `deposito:crear` |
| PATCH | `/deposito/incidencias/:id/resolver` | `deposito:editar` |

## Archivos

- `backend/src/modules/deposito/incidencias.controller.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `exposes` → [[service--deposito-incidencias|IncidenciasService]]

## Referenciado por

- [[component--front-deposito|deposito]] `calls` →
- [[component--front-deposito|deposito]] `calls` →
- [[component--front-deposito|deposito]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
