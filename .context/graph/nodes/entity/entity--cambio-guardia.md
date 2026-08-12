---
id: entity--cambio-guardia
tipo: ENTITY
nombre: CambioGuardia
nivel: L1
dominio: asistencia
resumen: "Solicitud de cambio/reemplazo de una asignacion de guardia (tabla ya existente en el esquema operaciones). El flujo de aprobacion queda fuera de esta fase del Modulo Asistencia; la entidad se registra para que la tabla sea consultable/consistente con el resto del modulo."
tabla: operaciones.cambios_guardias
archivos:
  - backend/src/shared/entities/cambio-guardia.entity.ts
edges:
  - [belongs_to, domain--asistencia]
  - [persisted_in, table--operaciones-cambios-guardias]
terminos: [cambio, guardia, cambios, guardias, operaciones, estado, pendiente, aprobado, rechazado, cancelado]
---

# CambioGuardia

Solicitud de cambio/reemplazo de una asignacion de guardia (tabla ya existente en el esquema operaciones). El flujo de aprobacion queda fuera de esta fase del Modulo Asistencia; la entidad se registra para que la tabla sea consultable/consistente con el resto del modulo.

- **Tabla:** [[table--operaciones-cambios-guardias|operaciones.cambios_guardias]]
- **Columnas mapeadas:** 10

## Estados y enumeraciones

- `EstadoCambioGuardia`: `PENDIENTE` · `APROBADO` · `RECHAZADO` · `CANCELADO`

## Archivos

- `backend/src/shared/entities/cambio-guardia.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-cambios-guardias|operaciones.cambios_guardias]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
