---
id: service--equipos-equipos
tipo: SERVICE
nombre: EquiposService
nivel: L2
dominio: equipos
resumen: Logica de negocio de equipos (modulo equipos).
capa: backend
archivos:
  - backend/src/modules/equipos/equipos.service.ts
edges:
  - [belongs_to, domain--equipos]
  - [uses, component--modulo-equipos]
  - [uses, entity--equipo]
  - [reads, table--equipos-equipos]
  - [uses, entity--categoria-equipo]
  - [reads, table--equipos-categorias-equipo]
<<<<<<< Updated upstream
  - [uses, entity--mantenimiento-equipo]
  - [reads, table--equipos-mantenimientos-equipos]
  - [uses, entity--prestamo-equipo]
  - [reads, table--equipos-prestamos-equipos]
  - [uses, entity--vehiculo]
  - [reads, table--vehiculos-vehiculos]
  - [uses, entity--parametro]
  - [reads, table--organizacion-parametros]
terminos: [equipos, equipo, categoria, mantenimiento, prestamo, vehiculo, parametro]
=======
terminos: [equipos, equipo, categoria]
>>>>>>> Stashed changes
---

# EquiposService

Logica de negocio de equipos (modulo equipos).


## Metodos

<<<<<<< Updated upstream
`findAll()` · `findOne()` · `create()` · `update()` · `remove()` · `listarMantenimientos()` · `crearMantenimiento()` · `asignarMovil()` · `historial()`
=======
`findAll()` · `findOne()` · `create()` · `update()` · `remove()`
>>>>>>> Stashed changes

## Archivos

- `backend/src/modules/equipos/equipos.service.ts`

## Relaciones

- `belongs_to` → [[domain--equipos|Equipos]]
- `uses` → [[component--modulo-equipos|equipos (modulo NestJS)]]
- `uses` → [[entity--equipo|Equipo]]
- `reads` → [[table--equipos-equipos|equipos.equipos]]
- `uses` → [[entity--categoria-equipo|CategoriaEquipo]]
- `reads` → [[table--equipos-categorias-equipo|equipos.categorias_equipo]]
<<<<<<< Updated upstream
- `uses` → [[entity--mantenimiento-equipo|MantenimientoEquipo]]
- `reads` → [[table--equipos-mantenimientos-equipos|equipos.mantenimientos_equipos]]
- `uses` → [[entity--prestamo-equipo|PrestamoEquipo]]
- `reads` → [[table--equipos-prestamos-equipos|equipos.prestamos_equipos]]
- `uses` → [[entity--vehiculo|Vehiculo]]
- `reads` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `uses` → [[entity--parametro|Parametro]]
- `reads` → [[table--organizacion-parametros|organizacion.parametros]]
=======
>>>>>>> Stashed changes

## Referenciado por

- [[api--equipos-equipos|EquiposController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
