---
id: entity--entrada-deposito-item
tipo: ENTITY
nombre: EntradaDepositoItem
nivel: L1
dominio: deposito
resumen: "Linea de una entrada -- un articulo (con cantidad) o un equipo individual. `movimientoId` referencia el deposito.movimientos que esta linea genero automaticamente al confirmarse la entrada."
tabla: deposito.entrada_items
archivos:
  - backend/src/shared/entities/entrada-deposito-item.entity.ts
edges:
  - [belongs_to, domain--deposito]
  - [persisted_in, table--deposito-entrada-items]
terminos: [entrada, deposito, item, items]
---

# EntradaDepositoItem

Linea de una entrada -- un articulo (con cantidad) o un equipo individual. `movimientoId` referencia el deposito.movimientos que esta linea genero automaticamente al confirmarse la entrada.

- **Tabla:** [[table--deposito-entrada-items|deposito.entrada_items]]
- **Columnas mapeadas:** 8

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`
- **Endpoints:** EntradasController
- **Servicios:** EntradasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/entrada-deposito-item.entity.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `persisted_in` → [[table--deposito-entrada-items|deposito.entrada_items]]

## Referenciado por

- [[service--deposito-entradas|EntradasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
