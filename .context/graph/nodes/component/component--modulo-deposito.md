---
id: component--modulo-deposito
tipo: COMPONENT
nombre: deposito (modulo NestJS)
nivel: L1
dominio: deposito
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de deposito.
capa: backend
archivos:
  - backend/src/modules/deposito/deposito.module.ts
edges:
  - [belongs_to, domain--deposito]
terminos: [deposito, modulo]
---

# deposito (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de deposito.


## Entidades registradas (forFeature)

CategoriaArticulo, Articulo, LoteArticulo, UbicacionDeposito, TenenciaDeposito, MovimientoDeposito, ProveedorDeposito, EntradaDeposito, EntradaDepositoItem, BajaDeposito, PrestamoDeposito, PrestamoDepositoItem, InventarioFisicoDeposito, InventarioFisicoItemDeposito, IncidenciaDeposito, MantenimientoDeposito, // Entidades de otros modulos que Deposito consulta/referencia
      // directamente (mismo patron de bajo acoplamiento ya usado en
      // Academia/Guardias): nunca se duplican sus estructuras.
      Equipo, Bombero, Vehiculo, Servicio, Cuartel, Parametro

## Archivos

- `backend/src/modules/deposito/deposito.module.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]

## Referenciado por

- [[service--deposito-alertas-deposito|AlertasDepositoService]] `uses` →
- [[service--deposito-articulos|ArticulosService]] `uses` →
- [[service--deposito-bajas|BajasService]] `uses` →
- [[service--deposito-categorias-articulo|CategoriasArticuloService]] `uses` →
- [[service--deposito-consultas-deposito|ConsultasDepositoService]] `uses` →
- [[service--deposito-dashboard-deposito|DashboardDepositoService]] `uses` →
- [[service--deposito-entradas|EntradasService]] `uses` →
- [[service--deposito-incidencias|IncidenciasService]] `uses` →
- [[service--deposito-integracion-deposito|IntegracionDepositoService]] `uses` →
- [[service--deposito-inventarios-fisicos|InventariosFisicosService]] `uses` →
- [[service--deposito-lotes-articulo|LotesArticuloService]] `uses` →
- [[service--deposito-mantenimientos|MantenimientosService]] `uses` →
- [[service--deposito-movimientos-deposito|MovimientosDepositoService]] `uses` →
- [[service--deposito-prestamos|PrestamosService]] `uses` →
- [[service--deposito-proveedores|ProveedoresService]] `uses` →
- [[service--deposito-ubicaciones-deposito|UbicacionesDepositoService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
