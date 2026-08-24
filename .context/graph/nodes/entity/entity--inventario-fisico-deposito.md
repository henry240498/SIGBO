---
id: entity--inventario-fisico-deposito
tipo: ENTITY
nombre: InventarioFisicoDeposito
nivel: L1
dominio: deposito
resumen: "Encabezado de un inventario fisico (seccion 15 del pedido): compara sistema vs conteo real sin modificar silenciosamente el stock -- las diferencias generan incidencias, el ajuste real se hace aparte con un movimiento de tipo \"Ajuste de inventario\" explicito."
tabla: deposito.inventarios_fisicos
archivos:
  - backend/src/shared/entities/inventario-fisico-deposito.entity.ts
edges:
  - [belongs_to, domain--deposito]
  - [persisted_in, table--deposito-inventarios-fisicos]
terminos: [inventario, fisico, deposito, inventarios, fisicos, estado, proceso, finalizado]
---

# InventarioFisicoDeposito

Encabezado de un inventario fisico (seccion 15 del pedido): compara sistema vs conteo real sin modificar silenciosamente el stock -- las diferencias generan incidencias, el ajuste real se hace aparte con un movimiento de tipo "Ajuste de inventario" explicito.

- **Tabla:** [[table--deposito-inventarios-fisicos|deposito.inventarios_fisicos]]
- **Columnas mapeadas:** 7

## Estados y enumeraciones

- `EstadoInventarioFisico`: `EN_PROCESO` · `FINALIZADO`

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/personal/[id]`
- **Endpoints:** InventariosFisicosController
- **Servicios:** InventariosFisicosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/inventario-fisico-deposito.entity.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `persisted_in` → [[table--deposito-inventarios-fisicos|deposito.inventarios_fisicos]]

## Referenciado por

- [[service--deposito-inventarios-fisicos|InventariosFisicosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
