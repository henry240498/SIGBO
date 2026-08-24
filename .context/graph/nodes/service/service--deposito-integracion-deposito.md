---
id: service--deposito-integracion-deposito
tipo: SERVICE
nombre: IntegracionDepositoService
nivel: L2
dominio: deposito
resumen: Integracion de solo-consulta con Equipos y Vehiculos (seccion 2 y 9 del pedido) -- Deposito nunca duplica la ficha del equipo ni la del vehiculo, solo resuelve nombres legibles sobre lo que ya tiene en tenencias.
capa: backend
archivos:
  - backend/src/modules/deposito/integracion-deposito.service.ts
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--modulo-deposito]
  - [uses, entity--tenencia-deposito]
  - [reads, table--deposito-tenencias]
  - [uses, entity--equipo]
  - [reads, table--equipos-equipos]
  - [uses, entity--vehiculo]
  - [reads, table--vehiculos-vehiculos]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--servicio]
  - [reads, table--servicios-servicios]
  - [uses, entity--ubicacion-deposito]
  - [reads, table--deposito-ubicaciones]
  - [uses, entity--articulo]
  - [reads, table--deposito-articulos]
  - [uses, service--deposito-movimientos-deposito]
terminos: [integracion, deposito, tenencia, equipo, vehiculo, bombero, servicio, ubicacion, articulo]
---

# IntegracionDepositoService

Integracion de solo-consulta con Equipos y Vehiculos (seccion 2 y 9 del pedido) -- Deposito nunca duplica la ficha del equipo ni la del vehiculo, solo resuelve nombres legibles sobre lo que ya tiene en tenencias.


## Metodos

`ubicacionDeEquipo()` · `equipamientoDeBombero()` · `equipamientoDeVehiculo()`

## Archivos

- `backend/src/modules/deposito/integracion-deposito.service.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--modulo-deposito|deposito (modulo NestJS)]]
- `uses` → [[entity--tenencia-deposito|TenenciaDeposito]]
- `reads` → [[table--deposito-tenencias|deposito.tenencias]]
- `uses` → [[entity--equipo|Equipo]]
- `reads` → [[table--equipos-equipos|equipos.equipos]]
- `uses` → [[entity--vehiculo|Vehiculo]]
- `reads` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--servicio|Servicio]]
- `reads` → [[table--servicios-servicios|servicios.servicios]]
- `uses` → [[entity--ubicacion-deposito|UbicacionDeposito]]
- `reads` → [[table--deposito-ubicaciones|deposito.ubicaciones]]
- `uses` → [[entity--articulo|Articulo]]
- `reads` → [[table--deposito-articulos|deposito.articulos]]
- `uses` → [[service--deposito-movimientos-deposito|MovimientosDepositoService]]

## Referenciado por

- [[service--deposito-consultas-deposito|ConsultasDepositoService]] `uses` →
- [[api--deposito-integracion-deposito|IntegracionDepositoController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
