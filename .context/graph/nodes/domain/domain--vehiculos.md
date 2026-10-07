---
id: domain--vehiculos
tipo: DOMAIN
nombre: Vehículos
nivel: L0
dominio: vehiculos
estado: ACTIVO
resumen: "Modulo funcional \"Vehículos\". Habilitado en la navegacion."
archivos:
  - frontend/src/lib/modulos.ts
terminos: [vehiculos]
---

# Vehículos

Modulo funcional "Vehículos". Habilitado en la navegacion.


## Archivos

- `frontend/src/lib/modulos.ts`

## Referenciado por

- [[entity--checklist-item-vehiculo|ChecklistItemVehiculo]] `belongs_to` →
- [[entity--consumo-combustible|ConsumoCombustible]] `belongs_to` →
- [[entity--dotacion-movil|DotacionMovil]] `belongs_to` →
- [[entity--mantenimiento-vehiculo|MantenimientoVehiculo]] `belongs_to` →
- [[entity--movil-estado-historial|MovilEstadoHistorial]] `belongs_to` →
- [[entity--posicion-movil|PosicionMovil]] `belongs_to` →
- [[entity--tripulacion-movil|TripulacionMovil]] `belongs_to` →
- [[entity--vehiculo|Vehiculo]] `belongs_to` →
- [[table--vehiculos-vehiculos|vehiculos.vehiculos]] `belongs_to` →
- [[table--vehiculos-mantenimientos-vehiculos|vehiculos.mantenimientos_vehiculos]] `belongs_to` →
- [[table--vehiculos-consumos-combustible|vehiculos.consumos_combustible]] `belongs_to` →
- [[table--vehiculos-checklist-items|vehiculos.checklist_items]] `belongs_to` →
- [[table--vehiculos-movil-estado-historial|vehiculos.movil_estado_historial]] `belongs_to` →
- [[table--vehiculos-posicion-actual|vehiculos.posicion_actual]] `belongs_to` →
- [[table--vehiculos-dotacion-movil|vehiculos.dotacion_movil]] `belongs_to` →
- [[table--vehiculos-tripulacion-movil|vehiculos.tripulacion_movil]] `belongs_to` →
- [[component--modulo-flota|flota (modulo NestJS)]] `belongs_to` →
- [[component--modulo-vehiculos|vehiculos (modulo NestJS)]] `belongs_to` →
- [[service--flota-disponibilidad|DisponibilidadService]] `belongs_to` →
- [[service--flota-dotacion|DotacionService]] `belongs_to` →
- [[service--flota-flota|FlotaService]] `belongs_to` →
- [[service--flota-informe|InformeService]] `belongs_to` →
- [[service--vehiculos-checklist-items|ChecklistItemsService]] `belongs_to` →
- [[service--vehiculos-vehiculos-autorizados|VehiculosAutorizadosService]] `belongs_to` →
- [[service--vehiculos-vehiculos|VehiculosService]] `belongs_to` →
- [[api--flota-flota|FlotaController]] `belongs_to` →
- [[api--vehiculos-checklist-items|ChecklistItemsController]] `belongs_to` →
- [[api--vehiculos-vehiculos-autorizados|VehiculosAutorizadosController]] `belongs_to` →
- [[api--vehiculos-vehiculos|VehiculosController]] `belongs_to` →
- [[screen--dashboard-vehiculos-checklist-items|/dashboard/vehiculos/checklist-items]] `belongs_to` →
- [[screen--dashboard-vehiculos-dotacion|/dashboard/vehiculos/dotacion]] `belongs_to` →
- [[screen--dashboard-vehiculos-flota|/dashboard/vehiculos/flota]] `belongs_to` →
- [[screen--dashboard-vehiculos-mapa|/dashboard/vehiculos/mapa]] `belongs_to` →
- [[screen--dashboard-vehiculos|/dashboard/vehiculos]] `belongs_to` →
- [[screen--dashboard-vehiculos-id|/dashboard/vehiculos/[id]]] `belongs_to` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
