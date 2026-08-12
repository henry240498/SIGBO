---
id: entity--prestamo-equipo
tipo: ENTITY
nombre: PrestamoEquipo
nivel: L1
dominio: equipos
resumen: Entidad PrestamoEquipo, persistida en equipos.prestamos_equipos.
tabla: equipos.prestamos_equipos
archivos:
  - backend/src/shared/entities/prestamo-equipo.entity.ts
edges:
  - [belongs_to, domain--equipos]
  - [persisted_in, table--equipos-prestamos-equipos]
terminos: [prestamo, equipo, prestamos, equipos, estado, prestado, devuelto, extraviado, daniado]
---

# PrestamoEquipo

Entidad PrestamoEquipo, persistida en equipos.prestamos_equipos.

- **Tabla:** [[table--equipos-prestamos-equipos|equipos.prestamos_equipos]]
- **Columnas mapeadas:** 9

## Estados y enumeraciones

- `EstadoPrestamoEquipo`: `PRESTADO` · `DEVUELTO` · `EXTRAVIADO` · `DANIADO`

## Archivos

- `backend/src/shared/entities/prestamo-equipo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--equipos|Equipos]]
- `persisted_in` → [[table--equipos-prestamos-equipos|equipos.prestamos_equipos]]

## Referenciado por

- [[service--equipos-equipamiento-bombero|EquipamientoBomberoService]] `uses` →
- [[service--equipos-equipos|EquiposService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
