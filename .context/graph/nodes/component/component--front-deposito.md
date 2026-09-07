---
id: component--front-deposito
tipo: COMPONENT
nombre: deposito
nivel: L2
dominio: deposito
resumen: "Helper de frontend \"deposito\" (83 exportaciones, consume 41 endpoint(s))."
capa: frontend
archivos:
  - frontend/src/lib/deposito.ts
edges:
  - [calls, api--deposito-categorias-articulo]
  - [calls, api--deposito-categorias-articulo]
  - [calls, api--deposito-categorias-articulo]
  - [calls, api--deposito-articulos]
  - [calls, api--deposito-articulos]
  - [calls, api--deposito-articulos]
  - [calls, api--deposito-lotes-articulo]
  - [calls, api--deposito-lotes-articulo]
  - [calls, api--deposito-lotes-articulo]
  - [calls, api--deposito-ubicaciones-deposito]
  - [calls, api--deposito-ubicaciones-deposito]
  - [calls, api--deposito-ubicaciones-deposito]
  - [calls, api--deposito-proveedores]
  - [calls, api--deposito-proveedores]
  - [calls, api--deposito-proveedores]
  - [calls, api--deposito-movimientos-deposito]
  - [calls, api--deposito-movimientos-deposito]
  - [calls, api--deposito-movimientos-deposito]
  - [calls, api--deposito-entradas]
  - [calls, api--deposito-entradas]
  - [calls, api--deposito-entradas]
  - [calls, api--deposito-bajas]
  - [calls, api--deposito-bajas]
  - [calls, api--deposito-prestamos]
  - [calls, api--deposito-prestamos]
  - [calls, api--deposito-prestamos]
  - [calls, api--deposito-prestamos]
  - [calls, api--deposito-mantenimientos]
  - [calls, api--deposito-mantenimientos]
  - [calls, api--deposito-mantenimientos]
  - [calls, api--deposito-inventarios-fisicos]
  - [calls, api--deposito-inventarios-fisicos]
  - [calls, api--deposito-inventarios-fisicos]
  - [calls, api--deposito-incidencias]
  - [calls, api--deposito-incidencias]
  - [calls, api--deposito-incidencias]
  - [calls, api--deposito-dashboard-deposito]
  - [calls, api--deposito-alertas-deposito]
  - [calls, api--deposito-integracion-deposito]
  - [calls, api--deposito-integracion-deposito]
  - [calls, api--deposito-integracion-deposito]
terminos: [deposito, cargar, tipos, ubicacion, tenencia, estados, elemento, movimiento, unidades, medida, motivos, baja, prestamo, tipo, categoria, articulo, lote, proveedor, entrada, item, estado]
---

# deposito

Helper de frontend "deposito" (83 exportaciones, consume 41 endpoint(s)).


## Archivos

- `frontend/src/lib/deposito.ts`

## Relaciones

- `calls` → [[api--deposito-categorias-articulo|CategoriasArticuloController]]
- `calls` → [[api--deposito-categorias-articulo|CategoriasArticuloController]]
- `calls` → [[api--deposito-categorias-articulo|CategoriasArticuloController]]
- `calls` → [[api--deposito-articulos|ArticulosController]]
- `calls` → [[api--deposito-articulos|ArticulosController]]
- `calls` → [[api--deposito-articulos|ArticulosController]]
- `calls` → [[api--deposito-lotes-articulo|LotesArticuloController]]
- `calls` → [[api--deposito-lotes-articulo|LotesArticuloController]]
- `calls` → [[api--deposito-lotes-articulo|LotesArticuloController]]
- `calls` → [[api--deposito-ubicaciones-deposito|UbicacionesDepositoController]]
- `calls` → [[api--deposito-ubicaciones-deposito|UbicacionesDepositoController]]
- `calls` → [[api--deposito-ubicaciones-deposito|UbicacionesDepositoController]]
- `calls` → [[api--deposito-proveedores|ProveedoresController]]
- `calls` → [[api--deposito-proveedores|ProveedoresController]]
- `calls` → [[api--deposito-proveedores|ProveedoresController]]
- `calls` → [[api--deposito-movimientos-deposito|MovimientosDepositoController]]
- `calls` → [[api--deposito-movimientos-deposito|MovimientosDepositoController]]
- `calls` → [[api--deposito-movimientos-deposito|MovimientosDepositoController]]
- `calls` → [[api--deposito-entradas|EntradasController]]
- `calls` → [[api--deposito-entradas|EntradasController]]
- `calls` → [[api--deposito-entradas|EntradasController]]
- `calls` → [[api--deposito-bajas|BajasController]]
- `calls` → [[api--deposito-bajas|BajasController]]
- `calls` → [[api--deposito-prestamos|PrestamosController]]
- `calls` → [[api--deposito-prestamos|PrestamosController]]
- `calls` → [[api--deposito-prestamos|PrestamosController]]
- `calls` → [[api--deposito-prestamos|PrestamosController]]
- `calls` → [[api--deposito-mantenimientos|MantenimientosController]]
- `calls` → [[api--deposito-mantenimientos|MantenimientosController]]
- `calls` → [[api--deposito-mantenimientos|MantenimientosController]]
- `calls` → [[api--deposito-inventarios-fisicos|InventariosFisicosController]]
- `calls` → [[api--deposito-inventarios-fisicos|InventariosFisicosController]]
- `calls` → [[api--deposito-inventarios-fisicos|InventariosFisicosController]]
- `calls` → [[api--deposito-incidencias|IncidenciasController]]
- `calls` → [[api--deposito-incidencias|IncidenciasController]]
- `calls` → [[api--deposito-incidencias|IncidenciasController]]
- `calls` → [[api--deposito-dashboard-deposito|DashboardDepositoController]]
- `calls` → [[api--deposito-alertas-deposito|AlertasDepositoController]]
- `calls` → [[api--deposito-integracion-deposito|IntegracionDepositoController]]
- `calls` → [[api--deposito-integracion-deposito|IntegracionDepositoController]]
- `calls` → [[api--deposito-integracion-deposito|IntegracionDepositoController]]

## Referenciado por

- [[screen--dashboard-deposito-articulos|/dashboard/deposito/articulos]] `uses` →
- [[screen--dashboard-deposito-articulos-id|/dashboard/deposito/articulos/[id]]] `uses` →
- [[screen--dashboard-deposito-bajas|/dashboard/deposito/bajas]] `uses` →
- [[screen--dashboard-deposito-categorias|/dashboard/deposito/categorias]] `uses` →
- [[screen--dashboard-deposito-entradas|/dashboard/deposito/entradas]] `uses` →
- [[screen--dashboard-deposito-incidencias|/dashboard/deposito/incidencias]] `uses` →
- [[screen--dashboard-deposito-inventarios-fisicos|/dashboard/deposito/inventarios-fisicos]] `uses` →
- [[screen--dashboard-deposito-inventarios-fisicos-id|/dashboard/deposito/inventarios-fisicos/[id]]] `uses` →
- [[screen--dashboard-deposito-mantenimientos|/dashboard/deposito/mantenimientos]] `uses` →
- [[screen--dashboard-deposito-movimientos|/dashboard/deposito/movimientos]] `uses` →
- [[screen--dashboard-deposito|/dashboard/deposito]] `uses` →
- [[screen--dashboard-deposito-prestamos|/dashboard/deposito/prestamos]] `uses` →
- [[screen--dashboard-deposito-proveedores|/dashboard/deposito/proveedores]] `uses` →
- [[screen--dashboard-deposito-ubicaciones|/dashboard/deposito/ubicaciones]] `uses` →
- [[screen--dashboard-finanzas-movimientos|/dashboard/finanzas/movimientos]] `uses` →
- [[screen--dashboard-finanzas-ordenes-pago|/dashboard/finanzas/ordenes-pago]] `uses` →
- [[screen--dashboard-personal-id|/dashboard/personal/[id]]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
