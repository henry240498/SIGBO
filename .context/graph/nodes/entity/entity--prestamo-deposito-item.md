---
id: entity--prestamo-deposito-item
tipo: ENTITY
nombre: PrestamoDepositoItem
nivel: L1
dominio: deposito
resumen: Entidad PrestamoDepositoItem, persistida en deposito.prestamo_items.
tabla: deposito.prestamo_items
archivos:
  - backend/src/shared/entities/prestamo-deposito-item.entity.ts
edges:
  - [belongs_to, domain--deposito]
  - [persisted_in, table--deposito-prestamo-items]
terminos: [prestamo, deposito, item, items, estado, pendiente, devuelto, extraviado, daniado]
---

# PrestamoDepositoItem

Entidad PrestamoDepositoItem, persistida en deposito.prestamo_items.

- **Tabla:** [[table--deposito-prestamo-items|deposito.prestamo_items]]
- **Columnas mapeadas:** 9

## Estados y enumeraciones

- `EstadoPrestamoItemDeposito`: `PENDIENTE` · `DEVUELTO` · `EXTRAVIADO` · `DANIADO`

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/personal/[id]`
- **Endpoints:** PrestamosController
- **Servicios:** PrestamosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/prestamo-deposito-item.entity.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `persisted_in` → [[table--deposito-prestamo-items|deposito.prestamo_items]]

## Referenciado por

- [[service--deposito-prestamos|PrestamosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
