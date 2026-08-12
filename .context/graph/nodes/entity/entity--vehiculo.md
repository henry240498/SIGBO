---
id: entity--vehiculo
tipo: ENTITY
nombre: Vehiculo
nivel: L1
dominio: vehiculos
resumen: Entidad Vehiculo, persistida en vehiculos.vehiculos.
tabla: vehiculos.vehiculos
archivos:
  - backend/src/shared/entities/vehiculo.entity.ts
edges:
  - [belongs_to, domain--vehiculos]
  - [persisted_in, table--vehiculos-vehiculos]
terminos: [vehiculo, vehiculos, estado, operativo, mantenimiento, fuera, servicio, baja]
---

# Vehiculo

Entidad Vehiculo, persistida en vehiculos.vehiculos.

- **Tabla:** [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- **Columnas mapeadas:** 32

## Estados y enumeraciones

- `EstadoVehiculo`: `OPERATIVO` · `EN_MANTENIMIENTO` · `FUERA_SERVICIO` · `BAJA`

## Archivos

- `backend/src/shared/entities/vehiculo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `persisted_in` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]

## Referenciado por

- [[service--equipos-equipos|EquiposService]] `uses` →
- [[service--publicaciones-publicaciones|PublicacionesService]] `uses` →
- [[service--servicios-servicios|ServiciosService]] `uses` →
- [[service--vehiculos-vehiculos-autorizados|VehiculosAutorizadosService]] `uses` →
- [[service--vehiculos-vehiculos|VehiculosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
