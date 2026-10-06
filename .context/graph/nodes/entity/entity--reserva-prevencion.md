---
id: entity--reserva-prevencion
tipo: ENTITY
nombre: Instalacion
nivel: L1
dominio: organizacion
resumen: Salon, patio de simulacros u otra instalacion reservable (migracion 083).
tabla: organizacion.instalaciones
archivos:
  - backend/src/shared/entities/reserva-prevencion.entity.ts
edges:
  - [belongs_to, domain--organizacion]
  - [persisted_in, table--organizacion-instalaciones]
terminos: [instalacion, instalaciones, organizacion, estado, reserva, solicitada, aprobada, rechazada, cancelada, resultado, inspeccion, aprobado, observaciones, rechazado]
---

# Instalacion

Salon, patio de simulacros u otra instalacion reservable (migracion 083).

- **Tabla:** [[table--organizacion-instalaciones|organizacion.instalaciones]]
- **Columnas mapeadas:** 25

## Estados y enumeraciones

- `EstadoReserva`: `SOLICITADA` · `APROBADA` · `RECHAZADA` · `CANCELADA`
- `ResultadoInspeccion`: `APROBADO` · `CON_OBSERVACIONES` · `RECHAZADO`

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/reserva-prevencion.entity.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `persisted_in` → [[table--organizacion-instalaciones|organizacion.instalaciones]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
