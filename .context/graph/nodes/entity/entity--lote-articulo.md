---
id: entity--lote-articulo
tipo: ENTITY
nombre: LoteArticulo
nivel: L1
dominio: deposito
resumen: "Lote/vencimiento de un articulo (seccion 17 del pedido): insumos medicos, medicamentos, materiales, productos quimicos."
tabla: deposito.lotes_articulo
archivos:
  - backend/src/shared/entities/lote-articulo.entity.ts
edges:
  - [belongs_to, domain--deposito]
  - [persisted_in, table--deposito-lotes-articulo]
terminos: [lote, articulo, lotes, deposito, estado, vigente, vencido, agotado]
---

# LoteArticulo

Lote/vencimiento de un articulo (seccion 17 del pedido): insumos medicos, medicamentos, materiales, productos quimicos.

- **Tabla:** [[table--deposito-lotes-articulo|deposito.lotes_articulo]]
- **Columnas mapeadas:** 6

## Estados y enumeraciones

- `EstadoLoteArticulo`: `VIGENTE` · `VENCIDO` · `AGOTADO`

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/personal/[id]`
- **Endpoints:** DashboardDepositoController, LotesArticuloController
- **Servicios:** DashboardDepositoService, LotesArticuloService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/lote-articulo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `persisted_in` → [[table--deposito-lotes-articulo|deposito.lotes_articulo]]

## Referenciado por

- [[service--deposito-dashboard-deposito|DashboardDepositoService]] `uses` →
- [[service--deposito-lotes-articulo|LotesArticuloService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
