---
id: entity--equipo
tipo: ENTITY
nombre: Equipo
nivel: L1
dominio: equipos
resumen: Entidad Equipo, persistida en equipos.equipos.
tabla: equipos.equipos
archivos:
  - backend/src/shared/entities/equipo.entity.ts
edges:
  - [belongs_to, domain--equipos]
  - [persisted_in, table--equipos-equipos]
terminos: [equipo, equipos, estado, operativo, mantenimiento, daniado, baja, prestado]
---

# Equipo

Entidad Equipo, persistida en equipos.equipos.

- **Tabla:** [[table--equipos-equipos|equipos.equipos]]
- **Columnas mapeadas:** 19

## Estados y enumeraciones

- `EstadoEquipo`: `OPERATIVO` · `EN_MANTENIMIENTO` · `DANIADO` · `BAJA` · `PRESTADO`

## Archivos

- `backend/src/shared/entities/equipo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--equipos|Equipos]]
- `persisted_in` → [[table--equipos-equipos|equipos.equipos]]

## Referenciado por

- [[service--equipos-equipamiento-bombero|EquipamientoBomberoService]] `uses` →
- [[service--equipos-equipos|EquiposService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
