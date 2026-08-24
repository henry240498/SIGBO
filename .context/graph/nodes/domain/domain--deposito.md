---
id: domain--deposito
tipo: DOMAIN
nombre: Depósito
nivel: L0
dominio: deposito
estado: ACTIVO
resumen: "Modulo funcional \"Depósito\". Habilitado en la navegacion."
archivos:
  - frontend/src/lib/modulos.ts
terminos: [deposito]
---

# Depósito

Modulo funcional "Depósito". Habilitado en la navegacion.


## Archivos

- `frontend/src/lib/modulos.ts`

## Referenciado por

- [[entity--articulo|Articulo]] `belongs_to` →
- [[entity--baja-deposito|BajaDeposito]] `belongs_to` →
- [[entity--categoria-articulo|CategoriaArticulo]] `belongs_to` →
- [[entity--entrada-deposito-item|EntradaDepositoItem]] `belongs_to` →
- [[entity--entrada-deposito|EntradaDeposito]] `belongs_to` →
- [[entity--incidencia-deposito|IncidenciaDeposito]] `belongs_to` →
- [[entity--inventario-fisico-deposito|InventarioFisicoDeposito]] `belongs_to` →
- [[entity--inventario-fisico-item-deposito|InventarioFisicoItemDeposito]] `belongs_to` →
- [[entity--lote-articulo|LoteArticulo]] `belongs_to` →
- [[entity--mantenimiento-deposito|MantenimientoDeposito]] `belongs_to` →
- [[entity--movimiento-deposito|MovimientoDeposito]] `belongs_to` →
- [[entity--prestamo-deposito-item|PrestamoDepositoItem]] `belongs_to` →
- [[entity--prestamo-deposito|PrestamoDeposito]] `belongs_to` →
- [[entity--proveedor-deposito|ProveedorDeposito]] `belongs_to` →
- [[entity--tenencia-deposito|TenenciaDeposito]] `belongs_to` →
- [[entity--ubicacion-deposito|UbicacionDeposito]] `belongs_to` →
- [[table--deposito-items-deposito|deposito.items_deposito]] `belongs_to` →
- [[table--deposito-movimientos-deposito|deposito.movimientos_deposito]] `belongs_to` →
- [[table--deposito-categorias-articulo|deposito.categorias_articulo]] `belongs_to` →
- [[table--deposito-articulos|deposito.articulos]] `belongs_to` →
- [[table--deposito-lotes-articulo|deposito.lotes_articulo]] `belongs_to` →
- [[table--deposito-ubicaciones|deposito.ubicaciones]] `belongs_to` →
- [[table--deposito-tenencias|deposito.tenencias]] `belongs_to` →
- [[table--deposito-movimientos|deposito.movimientos]] `belongs_to` →
- [[table--deposito-proveedores|deposito.proveedores]] `belongs_to` →
- [[table--deposito-entradas|deposito.entradas]] `belongs_to` →
- [[table--deposito-entrada-items|deposito.entrada_items]] `belongs_to` →
- [[table--deposito-bajas|deposito.bajas]] `belongs_to` →
- [[table--deposito-prestamos|deposito.prestamos]] `belongs_to` →
- [[table--deposito-prestamo-items|deposito.prestamo_items]] `belongs_to` →
- [[table--deposito-inventarios-fisicos|deposito.inventarios_fisicos]] `belongs_to` →
- [[table--deposito-inventario-fisico-items|deposito.inventario_fisico_items]] `belongs_to` →
- [[table--deposito-incidencias|deposito.incidencias]] `belongs_to` →
- [[table--deposito-mantenimientos|deposito.mantenimientos]] `belongs_to` →
- [[component--modulo-deposito|deposito (modulo NestJS)]] `belongs_to` →
- [[service--deposito-alertas-deposito|AlertasDepositoService]] `belongs_to` →
- [[service--deposito-articulos|ArticulosService]] `belongs_to` →
- [[service--deposito-bajas|BajasService]] `belongs_to` →
- [[service--deposito-categorias-articulo|CategoriasArticuloService]] `belongs_to` →
- [[service--deposito-consultas-deposito|ConsultasDepositoService]] `belongs_to` →
- [[service--deposito-dashboard-deposito|DashboardDepositoService]] `belongs_to` →
- [[service--deposito-entradas|EntradasService]] `belongs_to` →
- [[service--deposito-incidencias|IncidenciasService]] `belongs_to` →
- [[service--deposito-integracion-deposito|IntegracionDepositoService]] `belongs_to` →
- [[service--deposito-inventarios-fisicos|InventariosFisicosService]] `belongs_to` →
- [[service--deposito-lotes-articulo|LotesArticuloService]] `belongs_to` →
- [[service--deposito-mantenimientos|MantenimientosService]] `belongs_to` →
- [[service--deposito-movimientos-deposito|MovimientosDepositoService]] `belongs_to` →
- [[service--deposito-prestamos|PrestamosService]] `belongs_to` →
- [[service--deposito-proveedores|ProveedoresService]] `belongs_to` →
- [[service--deposito-ubicaciones-deposito|UbicacionesDepositoService]] `belongs_to` →
- [[api--deposito-alertas-deposito|AlertasDepositoController]] `belongs_to` →
- [[api--deposito-articulos|ArticulosController]] `belongs_to` →
- [[api--deposito-bajas|BajasController]] `belongs_to` →
- [[api--deposito-categorias-articulo|CategoriasArticuloController]] `belongs_to` →
- [[api--deposito-consultas-deposito|ConsultasDepositoController]] `belongs_to` →
- [[api--deposito-dashboard-deposito|DashboardDepositoController]] `belongs_to` →
- [[api--deposito-entradas|EntradasController]] `belongs_to` →
- [[api--deposito-incidencias|IncidenciasController]] `belongs_to` →
- [[api--deposito-integracion-deposito|IntegracionDepositoController]] `belongs_to` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
