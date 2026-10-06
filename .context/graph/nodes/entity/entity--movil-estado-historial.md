---
id: entity--movil-estado-historial
tipo: ENTITY
nombre: MovilEstadoHistorial
nivel: L1
dominio: vehiculos
resumen: "Cada cambio de estado operativo de un movil (migracion 077). Solo se agrega, nunca se modifica: es el rastro de donde estuvo cada unidad."
tabla: vehiculos.movil_estado_historial
archivos:
  - backend/src/shared/entities/movil-estado-historial.entity.ts
edges:
  - [belongs_to, domain--vehiculos]
  - [persisted_in, table--vehiculos-movil-estado-historial]
terminos: [movil, estado, historial, vehiculos]
---

# MovilEstadoHistorial

Cada cambio de estado operativo de un movil (migracion 077). Solo se agrega, nunca se modifica: es el rastro de donde estuvo cada unidad.

- **Tabla:** [[table--vehiculos-movil-estado-historial|vehiculos.movil_estado_historial]]
- **Columnas mapeadas:** 7

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/movil-estado-historial.entity.ts`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `persisted_in` → [[table--vehiculos-movil-estado-historial|vehiculos.movil_estado_historial]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
