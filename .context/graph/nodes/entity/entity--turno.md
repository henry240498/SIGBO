---
id: entity--turno
tipo: ENTITY
nombre: Turno
nivel: L1
dominio: organizacion
resumen: Entidad Turno, persistida en organizacion.turnos.
tabla: organizacion.turnos
archivos:
  - backend/src/shared/entities/turno.entity.ts
edges:
  - [belongs_to, domain--organizacion]
  - [persisted_in, table--organizacion-turnos]
terminos: [turno, turnos, organizacion]
---

# Turno

Entidad Turno, persistida en organizacion.turnos.

- **Tabla:** [[table--organizacion-turnos|organizacion.turnos]]
- **Columnas mapeadas:** 9

## Archivos

- `backend/src/shared/entities/turno.entity.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `persisted_in` → [[table--organizacion-turnos|organizacion.turnos]]

## Referenciado por

- [[service--organizacion-dashboard|DashboardService]] `uses` →
- [[service--organizacion-turnos|TurnosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
