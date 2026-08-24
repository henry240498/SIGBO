---
id: entity--ubicacion-deposito
tipo: ENTITY
nombre: UbicacionDeposito
nivel: L1
dominio: deposito
resumen: "Jerarquia fisica de ubicaciones de deposito: Institucion (implicita) -> Cuartel -> Deposito -> Sector -> Estanteria -> Ubicacion (seccion 5 del pedido). `tipoUbicacionId` referencia organizacion.parametros (tipo TIPO_UBICACION_DEPOSITO). `padreId` arma la jerarquia; `cuartelId` ancla la raiz a un organizacion.cuarteles real (reutilizado, no duplicado). Las ubicaciones \"externas o especiales\" (vehiculo, personal, servicio, otra institucion) NO son filas aca -- se registran en deposito.tenencias/movimientos via sus propias FKs (vehiculoId, bomberoId, servicioId), evitando una jerarquia polimorfica confusa."
tabla: deposito.ubicaciones
archivos:
  - backend/src/shared/entities/ubicacion-deposito.entity.ts
edges:
  - [belongs_to, domain--deposito]
  - [persisted_in, table--deposito-ubicaciones]
terminos: [ubicacion, deposito, ubicaciones, estado, activa, inactiva]
---

# UbicacionDeposito

Jerarquia fisica de ubicaciones de deposito: Institucion (implicita) -> Cuartel -> Deposito -> Sector -> Estanteria -> Ubicacion (seccion 5 del pedido). `tipoUbicacionId` referencia organizacion.parametros (tipo TIPO_UBICACION_DEPOSITO). `padreId` arma la jerarquia; `cuartelId` ancla la raiz a un organizacion.cuarteles real (reutilizado, no duplicado). Las ubicaciones "externas o especiales" (vehiculo, personal, servicio, otra institucion) NO son filas aca -- se registran en deposito.tenencias/movimientos via sus propias FKs (vehiculoId, bomberoId, servicioId), evitando una jerarquia polimorfica confusa.

- **Tabla:** [[table--deposito-ubicaciones|deposito.ubicaciones]]
- **Columnas mapeadas:** 9

## Estados y enumeraciones

- `EstadoUbicacionDeposito`: `ACTIVA` · `INACTIVA`

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/personal/[id]`
- **Endpoints:** EntradasController, IntegracionDepositoController, UbicacionesDepositoController
- **Servicios:** EntradasService, IntegracionDepositoService, UbicacionesDepositoService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/ubicacion-deposito.entity.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `persisted_in` → [[table--deposito-ubicaciones|deposito.ubicaciones]]

## Referenciado por

- [[service--deposito-entradas|EntradasService]] `uses` →
- [[service--deposito-integracion-deposito|IntegracionDepositoService]] `uses` →
- [[service--deposito-ubicaciones-deposito|UbicacionesDepositoService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
