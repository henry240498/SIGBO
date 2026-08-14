---
id: component--modulo-equipos
tipo: COMPONENT
nombre: equipos (modulo NestJS)
nivel: L1
dominio: equipos
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de equipos.
capa: backend
archivos:
  - backend/src/modules/equipos/equipos.module.ts
edges:
  - [belongs_to, domain--equipos]
terminos: [equipos, modulo]
---

# equipos (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de equipos.


## Entidades registradas (forFeature)

CategoriaEquipo, Equipo, PrestamoEquipo, MantenimientoEquipo, Vehiculo, Parametro

## Archivos

- `backend/src/modules/equipos/equipos.module.ts`

## Relaciones

- `belongs_to` → [[domain--equipos|Equipos]]

## Referenciado por

- [[service--equipos-categorias-equipo|CategoriasEquipoService]] `uses` →
- [[service--equipos-equipamiento-bombero|EquipamientoBomberoService]] `uses` →
- [[service--equipos-equipos|EquiposService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
