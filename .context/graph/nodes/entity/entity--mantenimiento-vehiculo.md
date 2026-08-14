---
id: entity--mantenimiento-vehiculo
tipo: ENTITY
nombre: MantenimientoVehiculo
nivel: L1
dominio: vehiculos
resumen: Entidad MantenimientoVehiculo, persistida en vehiculos.mantenimientos_vehiculos.
tabla: vehiculos.mantenimientos_vehiculos
archivos:
  - backend/src/shared/entities/mantenimiento-vehiculo.entity.ts
edges:
  - [belongs_to, domain--vehiculos]
  - [persisted_in, table--vehiculos-mantenimientos-vehiculos]
terminos: [mantenimiento, vehiculo, mantenimientos, vehiculos, tipo, preventivo, correctivo, emergencia, itv, reparacion]
---

# MantenimientoVehiculo

Entidad MantenimientoVehiculo, persistida en vehiculos.mantenimientos_vehiculos.

- **Tabla:** [[table--vehiculos-mantenimientos-vehiculos|vehiculos.mantenimientos_vehiculos]]
- **Columnas mapeadas:** 11

## Estados y enumeraciones

- `TipoMantenimientoVehiculo`: `PREVENTIVO` · `CORRECTIVO` · `EMERGENCIA` · `ITV` · `REPARACION`

## Donde se usa

- **Pantallas:** `/dashboard/equipos/[id]`, `/dashboard/personal/[id]`, `/dashboard/servicios/nuevo`, `/dashboard/vehiculos`, `/dashboard/vehiculos/[id]`, `/dashboard/vehiculos/checklist-items`
- **Endpoints:** VehiculosController
- **Servicios:** VehiculosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/mantenimiento-vehiculo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `persisted_in` → [[table--vehiculos-mantenimientos-vehiculos|vehiculos.mantenimientos_vehiculos]]

## Referenciado por

- [[service--vehiculos-vehiculos|VehiculosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
