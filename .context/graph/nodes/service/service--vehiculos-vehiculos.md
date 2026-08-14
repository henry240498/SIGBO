---
id: service--vehiculos-vehiculos
tipo: SERVICE
nombre: VehiculosService
nivel: L2
dominio: vehiculos
resumen: Logica de negocio de vehiculos (modulo vehiculos).
capa: backend
archivos:
  - backend/src/modules/vehiculos/vehiculos.service.ts
edges:
  - [belongs_to, domain--vehiculos]
  - [uses, component--modulo-vehiculos]
  - [uses, entity--vehiculo]
  - [reads, table--vehiculos-vehiculos]
  - [uses, entity--mantenimiento-vehiculo]
  - [reads, table--vehiculos-mantenimientos-vehiculos]
  - [uses, entity--consumo-combustible]
  - [reads, table--vehiculos-consumos-combustible]
  - [uses, entity--servicio]
  - [reads, table--servicios-servicios]
terminos: [vehiculos, vehiculo, mantenimiento, consumo, combustible, servicio]
---

# VehiculosService

Logica de negocio de vehiculos (modulo vehiculos).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `darBaja()` · `listarMantenimientos()` · `crearMantenimiento()` · `listarCombustible()` · `crearCombustible()` · `historial()`

## Archivos

- `backend/src/modules/vehiculos/vehiculos.service.ts`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `uses` → [[component--modulo-vehiculos|vehiculos (modulo NestJS)]]
- `uses` → [[entity--vehiculo|Vehiculo]]
- `reads` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `uses` → [[entity--mantenimiento-vehiculo|MantenimientoVehiculo]]
- `reads` → [[table--vehiculos-mantenimientos-vehiculos|vehiculos.mantenimientos_vehiculos]]
- `uses` → [[entity--consumo-combustible|ConsumoCombustible]]
- `reads` → [[table--vehiculos-consumos-combustible|vehiculos.consumos_combustible]]
- `uses` → [[entity--servicio|Servicio]]
- `reads` → [[table--servicios-servicios|servicios.servicios]]

## Referenciado por

- [[api--vehiculos-vehiculos|VehiculosController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
