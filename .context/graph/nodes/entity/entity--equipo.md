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

## Donde se usa

- **Pantallas:** `/dashboard/asistencia/eventos/[id]`, `/dashboard/asistencia/registro`, `/dashboard/equipos`, `/dashboard/equipos/[id]`, `/dashboard/equipos/categorias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/organizacion/ascensos`, `/dashboard/organizacion/cuarteles`, `/dashboard/organizacion/designaciones`, `/dashboard/organizacion/turnos`, `/dashboard/personal`, `/dashboard/personal/[id]`, `/dashboard/personal/nuevo`, `/dashboard/seguridad/usuarios`, `/dashboard/servicios/nuevo`, `/dashboard/vehiculos`, `/dashboard/vehiculos/[id]`, `/dashboard/vehiculos/checklist-items`
- **Endpoints:** EquipamientoBomberoController, EquiposController, InspeccionesMovilController
- **Servicios:** EquipamientoBomberoService, EquiposService, InspeccionesMovilService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/equipo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--equipos|Equipos]]
- `persisted_in` → [[table--equipos-equipos|equipos.equipos]]

## Referenciado por

- [[service--equipos-equipamiento-bombero|EquipamientoBomberoService]] `uses` →
- [[service--equipos-equipos|EquiposService]] `uses` →
- [[service--guardias-inspecciones-movil|InspeccionesMovilService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
