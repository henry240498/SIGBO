---
id: entity--movimiento-deposito
tipo: ENTITY
nombre: MovimientoDeposito
nivel: L1
dominio: deposito
resumen: "Historial append-only de todo movimiento de Deposito (seccion 6 del pedido). Nunca se edita ni se borra -- cualquier correccion se hace con un movimiento nuevo. Cada fila representa un evento ya ocurrido; el \"estado actual\" vive en deposito.tenencias, actualizado en la misma transaccion que crea el movimiento correspondiente."
tabla: deposito.movimientos
archivos:
  - backend/src/shared/entities/movimiento-deposito.entity.ts
edges:
  - [belongs_to, domain--deposito]
  - [persisted_in, table--deposito-movimientos]
terminos: [movimiento, deposito, movimientos]
---

# MovimientoDeposito

Historial append-only de todo movimiento de Deposito (seccion 6 del pedido). Nunca se edita ni se borra -- cualquier correccion se hace con un movimiento nuevo. Cada fila representa un evento ya ocurrido; el "estado actual" vive en deposito.tenencias, actualizado en la misma transaccion que crea el movimiento correspondiente.

- **Tabla:** [[table--deposito-movimientos|deposito.movimientos]]
- **Columnas mapeadas:** 20

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`
- **Endpoints:** MovimientosDepositoController
- **Servicios:** MovimientosDepositoService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/movimiento-deposito.entity.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `persisted_in` → [[table--deposito-movimientos|deposito.movimientos]]

## Referenciado por

- [[service--deposito-movimientos-deposito|MovimientosDepositoService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
