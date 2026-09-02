---
id: entity--articulo
tipo: ENTITY
nombre: Articulo
nivel: L1
dominio: deposito
resumen: "Item de inventario por CANTIDAD (guantes descartables, agua, material de limpieza, insumos). Distinto de un elemento con trazabilidad individual, que sigue viviendo en equipos.equipos (nunca duplicado aqui). El id es un GUID tecnico interno; `codigo` es el codigo institucional, editable, independiente del id, con control de duplicados."
tabla: deposito.articulos
archivos:
  - backend/src/shared/entities/articulo.entity.ts
edges:
  - [belongs_to, domain--deposito]
  - [persisted_in, table--deposito-articulos]
terminos: [articulo, articulos, deposito, estado, activo, inactivo]
---

# Articulo

Item de inventario por CANTIDAD (guantes descartables, agua, material de limpieza, insumos). Distinto de un elemento con trazabilidad individual, que sigue viviendo en equipos.equipos (nunca duplicado aqui). El id es un GUID tecnico interno; `codigo` es el codigo institucional, editable, independiente del id, con control de duplicados.

- **Tabla:** [[table--deposito-articulos|deposito.articulos]]
- **Columnas mapeadas:** 14

## Estados y enumeraciones

- `EstadoArticulo`: `ACTIVO` · `INACTIVO`

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`
- **Endpoints:** ArticulosController, BajasController, ConsultasDepositoController, DashboardDepositoController, EntradasController, IntegracionDepositoController, LotesArticuloController, MantenimientosController, MovimientosDepositoController, PrestamosController
- **Servicios:** ArticulosService, BajasService, ConsultasDepositoService, DashboardDepositoService, EntradasService, IaToolsService, IntegracionDepositoService, LotesArticuloService, MantenimientosService, MovimientosDepositoService, PrestamosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/articulo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `persisted_in` → [[table--deposito-articulos|deposito.articulos]]

## Referenciado por

- [[service--deposito-articulos|ArticulosService]] `uses` →
- [[service--deposito-bajas|BajasService]] `uses` →
- [[service--deposito-consultas-deposito|ConsultasDepositoService]] `uses` →
- [[service--deposito-dashboard-deposito|DashboardDepositoService]] `uses` →
- [[service--deposito-entradas|EntradasService]] `uses` →
- [[service--deposito-integracion-deposito|IntegracionDepositoService]] `uses` →
- [[service--deposito-lotes-articulo|LotesArticuloService]] `uses` →
- [[service--deposito-mantenimientos|MantenimientosService]] `uses` →
- [[service--deposito-movimientos-deposito|MovimientosDepositoService]] `uses` →
- [[service--deposito-prestamos|PrestamosService]] `uses` →
- [[service--ia-ia-tools|IaToolsService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
