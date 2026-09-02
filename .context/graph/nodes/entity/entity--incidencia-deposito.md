---
id: entity--incidencia-deposito
tipo: ENTITY
nombre: IncidenciaDeposito
nivel: L1
dominio: deposito
resumen: Unica entidad de incidencias de Deposito -- no existia ningun mecanismo equivalente en el sistema (ni en Vehiculos ni en la inspeccion de guardia, confirmado por auditoria previa). Cubre tanto una diferencia de inventario fisico como un item faltante/danado detectado en una inspeccion de movil (seccion 9 y 15 del pedido), enlazando por FK a la inspeccion/item de origen sin duplicar esos datos.
tabla: deposito.incidencias
archivos:
  - backend/src/shared/entities/incidencia-deposito.entity.ts
edges:
  - [belongs_to, domain--deposito]
  - [persisted_in, table--deposito-incidencias]
terminos: [incidencia, deposito, incidencias, origen, inspeccion, vehiculo, inventario, fisico, manual, otro, gravedad, baja, media, alta, estado, abierta, revision, resuelta, descartada]
---

# IncidenciaDeposito

Unica entidad de incidencias de Deposito -- no existia ningun mecanismo equivalente en el sistema (ni en Vehiculos ni en la inspeccion de guardia, confirmado por auditoria previa). Cubre tanto una diferencia de inventario fisico como un item faltante/danado detectado en una inspeccion de movil (seccion 9 y 15 del pedido), enlazando por FK a la inspeccion/item de origen sin duplicar esos datos.

- **Tabla:** [[table--deposito-incidencias|deposito.incidencias]]
- **Columnas mapeadas:** 16

## Estados y enumeraciones

- `OrigenIncidenciaDeposito`: `INSPECCION_VEHICULO` · `INVENTARIO_FISICO` · `MANUAL` · `OTRO`
- `GravedadIncidenciaDeposito`: `BAJA` · `MEDIA` · `ALTA`
- `EstadoIncidenciaDeposito`: `ABIERTA` · `EN_REVISION` · `RESUELTA` · `DESCARTADA`

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`
- **Endpoints:** DashboardDepositoController, IncidenciasController, InventariosFisicosController
- **Servicios:** DashboardDepositoService, IncidenciasService, InventariosFisicosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/incidencia-deposito.entity.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `persisted_in` → [[table--deposito-incidencias|deposito.incidencias]]

## Referenciado por

- [[service--deposito-dashboard-deposito|DashboardDepositoService]] `uses` →
- [[service--deposito-incidencias|IncidenciasService]] `uses` →
- [[service--deposito-inventarios-fisicos|InventariosFisicosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
