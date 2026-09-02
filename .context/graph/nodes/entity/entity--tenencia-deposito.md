---
id: entity--tenencia-deposito
tipo: ENTITY
nombre: TenenciaDeposito
nivel: L1
dominio: deposito
resumen: "\"Donde/con quien esta esto AHORA\" -- la tabla de consulta rapida que responde la pregunta central del pedido. Se actualiza EXCLUSIVAMENTE junto con un deposito.movimientos en la misma transaccion (nunca se edita sola -- ver DepositoMovimientosService). Un elemento con trazabilidad individual (`tipo_elemento='EQUIPO'`) tiene una unica fila activa; un articulo por cantidad (`tipo_elemento='ARTICULO'`) puede tener varias filas (una por cada ubicacion/tenedor donde hay stock repartido), cada una con su `cantidad`."
tabla: deposito.tenencias
archivos:
  - backend/src/shared/entities/tenencia-deposito.entity.ts
edges:
  - [belongs_to, domain--deposito]
  - [persisted_in, table--deposito-tenencias]
terminos: [tenencia, deposito, tenencias, tipo, elemento, equipo, articulo]
---

# TenenciaDeposito

"Donde/con quien esta esto AHORA" -- la tabla de consulta rapida que responde la pregunta central del pedido. Se actualiza EXCLUSIVAMENTE junto con un deposito.movimientos en la misma transaccion (nunca se edita sola -- ver DepositoMovimientosService). Un elemento con trazabilidad individual (`tipo_elemento='EQUIPO'`) tiene una unica fila activa; un articulo por cantidad (`tipo_elemento='ARTICULO'`) puede tener varias filas (una por cada ubicacion/tenedor donde hay stock repartido), cada una con su `cantidad`.

- **Tabla:** [[table--deposito-tenencias|deposito.tenencias]]
- **Columnas mapeadas:** 14

## Estados y enumeraciones

- `TipoElementoDeposito`: `EQUIPO` · `ARTICULO`

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`
- **Endpoints:** ArticulosController, BajasController, ConsultasDepositoController, DashboardDepositoController, IntegracionDepositoController, InventariosFisicosController, MantenimientosController, MovimientosDepositoController
- **Servicios:** ArticulosService, BajasService, ConsultasDepositoService, DashboardDepositoService, IntegracionDepositoService, InventariosFisicosService, MantenimientosService, MovimientosDepositoService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/tenencia-deposito.entity.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `persisted_in` → [[table--deposito-tenencias|deposito.tenencias]]

## Referenciado por

- [[service--deposito-articulos|ArticulosService]] `uses` →
- [[service--deposito-bajas|BajasService]] `uses` →
- [[service--deposito-consultas-deposito|ConsultasDepositoService]] `uses` →
- [[service--deposito-dashboard-deposito|DashboardDepositoService]] `uses` →
- [[service--deposito-integracion-deposito|IntegracionDepositoService]] `uses` →
- [[service--deposito-inventarios-fisicos|InventariosFisicosService]] `uses` →
- [[service--deposito-mantenimientos|MantenimientosService]] `uses` →
- [[service--deposito-movimientos-deposito|MovimientosDepositoService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
