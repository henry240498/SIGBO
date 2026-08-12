---
id: entity--mantenimiento-equipo
tipo: ENTITY
nombre: MantenimientoEquipo
nivel: L1
dominio: equipos
resumen: Entidad MantenimientoEquipo, persistida en equipos.mantenimientos_equipos.
tabla: equipos.mantenimientos_equipos
archivos:
  - backend/src/shared/entities/mantenimiento-equipo.entity.ts
edges:
  - [belongs_to, domain--equipos]
  - [persisted_in, table--equipos-mantenimientos-equipos]
terminos: [mantenimiento, equipo, mantenimientos, equipos, tipo, preventivo, correctivo, calibracion]
---

# MantenimientoEquipo

Entidad MantenimientoEquipo, persistida en equipos.mantenimientos_equipos.

- **Tabla:** [[table--equipos-mantenimientos-equipos|equipos.mantenimientos_equipos]]
- **Columnas mapeadas:** 10

## Estados y enumeraciones

- `TipoMantenimientoEquipo`: `PREVENTIVO` · `CORRECTIVO` · `CALIBRACION`

## Archivos

- `backend/src/shared/entities/mantenimiento-equipo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--equipos|Equipos]]
- `persisted_in` → [[table--equipos-mantenimientos-equipos|equipos.mantenimientos_equipos]]

## Referenciado por

- [[service--equipos-equipos|EquiposService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
