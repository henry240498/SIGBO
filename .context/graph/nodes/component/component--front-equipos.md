---
id: component--front-equipos
tipo: COMPONENT
nombre: equipos
nivel: L2
dominio: equipos
resumen: "Helper de frontend \"equipos\" (24 exportaciones, consume 8 endpoint(s))."
capa: frontend
archivos:
  - frontend/src/lib/equipos.ts
edges:
  - [calls, api--equipos-categorias-equipo]
  - [calls, api--equipos-categorias-equipo]
  - [calls, api--equipos-categorias-equipo]
  - [calls, api--equipos-equipos]
  - [calls, api--equipos-equipos]
  - [calls, api--equipos-equipos]
  - [calls, api--equipos-equipamiento-bombero]
  - [calls, api--equipos-equipamiento-bombero]
terminos: [equipos, estado, equipo, estados, categoria, mantenimiento, prestamo, evento, historial, cargar, ubicaciones, categorias, crear, actualizar, eliminar, asignar, movil, mantenimientos]
---

# equipos

Helper de frontend "equipos" (24 exportaciones, consume 8 endpoint(s)).


## Archivos

- `frontend/src/lib/equipos.ts`

## Relaciones

- `calls` → [[api--equipos-categorias-equipo|CategoriasEquipoController]]
- `calls` → [[api--equipos-categorias-equipo|CategoriasEquipoController]]
- `calls` → [[api--equipos-categorias-equipo|CategoriasEquipoController]]
- `calls` → [[api--equipos-equipos|EquiposController]]
- `calls` → [[api--equipos-equipos|EquiposController]]
- `calls` → [[api--equipos-equipos|EquiposController]]
- `calls` → [[api--equipos-equipamiento-bombero|EquipamientoBomberoController]]
- `calls` → [[api--equipos-equipamiento-bombero|EquipamientoBomberoController]]

## Referenciado por

- [[screen--dashboard-equipos-categorias|/dashboard/equipos/categorias]] `uses` →
- [[screen--dashboard-equipos|/dashboard/equipos]] `uses` →
- [[screen--dashboard-equipos-id|/dashboard/equipos/[id]]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
