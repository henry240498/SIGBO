---
id: api--deposito-consultas-deposito
tipo: API
nombre: ConsultasDepositoController
nivel: L2
dominio: deposito
resumen: Superficie HTTP de consultas deposito bajo /api/v1/deposito/consultas.
prefijo: /api/v1/deposito/consultas
capa: backend
permisos: [deposito:ver]
archivos:
  - backend/src/modules/deposito/consultas-deposito.controller.ts
edges:
  - [belongs_to, domain--deposito]
  - [exposes, service--deposito-consultas-deposito]
terminos: [consultas, deposito, ver]
---

# ConsultasDepositoController

Superficie HTTP de consultas deposito bajo /api/v1/deposito/consultas.

- **Prefijo:** `/api/v1/deposito/consultas`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/deposito/consultas/disponibles-por-categoria/:categoriaEquipoId` | `deposito:ver` |
| GET | `/deposito/consultas/quien-tiene/:equipoId` | `deposito:ver` |
| GET | `/deposito/consultas/vencidos` | `deposito:ver` |
| GET | `/deposito/consultas/vehiculo/:vehiculoId/estado/:nombreEstado` | `deposito:ver` |

## Archivos

- `backend/src/modules/deposito/consultas-deposito.controller.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `exposes` → [[service--deposito-consultas-deposito|ConsultasDepositoService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
