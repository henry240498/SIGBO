---
id: service--equipos-equipamiento-bombero
tipo: SERVICE
nombre: EquipamientoBomberoService
nivel: L2
dominio: equipos
resumen: Logica de negocio de equipamiento bombero (modulo equipos).
capa: backend
archivos:
  - backend/src/modules/equipos/equipamiento-bombero.service.ts
edges:
  - [belongs_to, domain--equipos]
  - [uses, component--modulo-equipos]
  - [uses, entity--prestamo-equipo]
  - [reads, table--equipos-prestamos-equipos]
  - [uses, entity--equipo]
  - [reads, table--equipos-equipos]
terminos: [equipamiento, bombero, equipos, prestamo, equipo]
---

# EquipamientoBomberoService

Logica de negocio de equipamiento bombero (modulo equipos).


## Metodos

`historial()` · `prestar()` · `devolver()`

## Archivos

- `backend/src/modules/equipos/equipamiento-bombero.service.ts`

## Relaciones

- `belongs_to` → [[domain--equipos|Equipos]]
- `uses` → [[component--modulo-equipos|equipos (modulo NestJS)]]
- `uses` → [[entity--prestamo-equipo|PrestamoEquipo]]
- `reads` → [[table--equipos-prestamos-equipos|equipos.prestamos_equipos]]
- `uses` → [[entity--equipo|Equipo]]
- `reads` → [[table--equipos-equipos|equipos.equipos]]

## Referenciado por

- [[api--equipos-equipamiento-bombero|EquipamientoBomberoController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
