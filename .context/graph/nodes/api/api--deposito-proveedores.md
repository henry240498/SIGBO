---
id: api--deposito-proveedores
tipo: API
nombre: ProveedoresController
nivel: L2
dominio: deposito
resumen: Superficie HTTP de proveedores bajo /api/v1/deposito/proveedores.
prefijo: /api/v1/deposito/proveedores
capa: backend
permisos: [deposito:ver, deposito:crear, deposito:editar]
archivos:
  - backend/src/modules/deposito/proveedores.controller.ts
edges:
  - [belongs_to, domain--deposito]
  - [exposes, service--deposito-proveedores]
terminos: [proveedores, deposito, ver, crear, editar]
---

# ProveedoresController

Superficie HTTP de proveedores bajo /api/v1/deposito/proveedores.

- **Prefijo:** `/api/v1/deposito/proveedores`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/deposito/proveedores` | `deposito:ver` |
| GET | `/deposito/proveedores/:id` | `deposito:ver` |
| POST | `/deposito/proveedores` | `deposito:crear` |
| PATCH | `/deposito/proveedores/:id` | `deposito:editar` |

## Archivos

- `backend/src/modules/deposito/proveedores.controller.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `exposes` → [[service--deposito-proveedores|ProveedoresService]]

## Referenciado por

- [[component--front-deposito|deposito]] `calls` →
- [[component--front-deposito|deposito]] `calls` →
- [[component--front-deposito|deposito]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
