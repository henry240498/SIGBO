---
id: api--deposito-prestamos
tipo: API
nombre: PrestamosController
nivel: L2
dominio: deposito
resumen: Superficie HTTP de prestamos bajo /api/v1/deposito/prestamos.
prefijo: /api/v1/deposito/prestamos
capa: backend
permisos: [deposito:ver, deposito:prestar]
archivos:
  - backend/src/modules/deposito/prestamos.controller.ts
edges:
  - [belongs_to, domain--deposito]
  - [exposes, service--deposito-prestamos]
terminos: [prestamos, deposito, ver, prestar]
---

# PrestamosController

Superficie HTTP de prestamos bajo /api/v1/deposito/prestamos.

- **Prefijo:** `/api/v1/deposito/prestamos`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/deposito/prestamos` | `deposito:ver` |
| GET | `/deposito/prestamos/vencidos` | `deposito:ver` |
| GET | `/deposito/prestamos/:id` | `deposito:ver` |
| GET | `/deposito/prestamos/:id/items` | `deposito:ver` |
| POST | `/deposito/prestamos` | `deposito:prestar` |
| POST | `/deposito/prestamos/:id/devolver` | `deposito:prestar` |

## Archivos

- `backend/src/modules/deposito/prestamos.controller.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `exposes` → [[service--deposito-prestamos|PrestamosService]]

## Referenciado por

- [[component--front-deposito|deposito]] `calls` →
- [[component--front-deposito|deposito]] `calls` →
- [[component--front-deposito|deposito]] `calls` →
- [[component--front-deposito|deposito]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
