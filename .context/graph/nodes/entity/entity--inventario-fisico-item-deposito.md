---
id: entity--inventario-fisico-item-deposito
tipo: ENTITY
nombre: InventarioFisicoItemDeposito
nivel: L1
dominio: deposito
resumen: Entidad InventarioFisicoItemDeposito, persistida en deposito.inventario_fisico_items.
tabla: deposito.inventario_fisico_items
archivos:
  - backend/src/shared/entities/inventario-fisico-item-deposito.entity.ts
edges:
  - [belongs_to, domain--deposito]
  - [persisted_in, table--deposito-inventario-fisico-items]
terminos: [inventario, fisico, item, deposito, items]
---

# InventarioFisicoItemDeposito

Entidad InventarioFisicoItemDeposito, persistida en deposito.inventario_fisico_items.

- **Tabla:** [[table--deposito-inventario-fisico-items|deposito.inventario_fisico_items]]
- **Columnas mapeadas:** 9

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`
- **Endpoints:** InventariosFisicosController
- **Servicios:** InventariosFisicosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/inventario-fisico-item-deposito.entity.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `persisted_in` → [[table--deposito-inventario-fisico-items|deposito.inventario_fisico_items]]

## Referenciado por

- [[service--deposito-inventarios-fisicos|InventariosFisicosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
