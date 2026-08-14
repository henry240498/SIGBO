---
id: component--modulo-vehiculos
tipo: COMPONENT
nombre: vehiculos (modulo NestJS)
nivel: L1
dominio: vehiculos
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de vehiculos.
capa: backend
archivos:
  - backend/src/modules/vehiculos/vehiculos.module.ts
edges:
  - [belongs_to, domain--vehiculos]
terminos: [vehiculos, modulo]
---

# vehiculos (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de vehiculos.


## Entidades registradas (forFeature)

<<<<<<< Updated upstream
Vehiculo, VehiculoAutorizado, MantenimientoVehiculo, ConsumoCombustible, ChecklistItemVehiculo, Servicio
=======
Vehiculo, VehiculoAutorizado
>>>>>>> Stashed changes

## Archivos

- `backend/src/modules/vehiculos/vehiculos.module.ts`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]

## Referenciado por

<<<<<<< Updated upstream
- [[service--vehiculos-checklist-items|ChecklistItemsService]] `uses` →
=======
>>>>>>> Stashed changes
- [[service--vehiculos-vehiculos-autorizados|VehiculosAutorizadosService]] `uses` →
- [[service--vehiculos-vehiculos|VehiculosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
