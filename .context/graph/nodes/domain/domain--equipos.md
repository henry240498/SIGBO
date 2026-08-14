---
id: domain--equipos
tipo: DOMAIN
nombre: Equipos
nivel: L0
dominio: equipos
estado: ACTIVO
resumen: "Modulo funcional \"Equipos\". Habilitado en la navegacion."
archivos:
  - frontend/src/lib/modulos.ts
terminos: [equipos]
---

# Equipos

Modulo funcional "Equipos". Habilitado en la navegacion.


## Archivos

- `frontend/src/lib/modulos.ts`

## Referenciado por

- [[entity--categoria-equipo|CategoriaEquipo]] `belongs_to` →
- [[entity--equipo|Equipo]] `belongs_to` →
- [[entity--mantenimiento-equipo|MantenimientoEquipo]] `belongs_to` →
- [[entity--prestamo-equipo|PrestamoEquipo]] `belongs_to` →
- [[table--equipos-categorias-equipo|equipos.categorias_equipo]] `belongs_to` →
- [[table--equipos-equipos|equipos.equipos]] `belongs_to` →
- [[table--equipos-mantenimientos-equipos|equipos.mantenimientos_equipos]] `belongs_to` →
- [[table--equipos-prestamos-equipos|equipos.prestamos_equipos]] `belongs_to` →
- [[component--modulo-equipos|equipos (modulo NestJS)]] `belongs_to` →
- [[service--equipos-categorias-equipo|CategoriasEquipoService]] `belongs_to` →
- [[service--equipos-equipamiento-bombero|EquipamientoBomberoService]] `belongs_to` →
- [[service--equipos-equipos|EquiposService]] `belongs_to` →
- [[api--equipos-categorias-equipo|CategoriasEquipoController]] `belongs_to` →
- [[api--equipos-equipamiento-bombero|EquipamientoBomberoController]] `belongs_to` →
- [[api--equipos-equipos|EquiposController]] `belongs_to` →
- [[screen--dashboard-equipos-categorias|/dashboard/equipos/categorias]] `belongs_to` →
- [[screen--dashboard-equipos|/dashboard/equipos]] `belongs_to` →
- [[screen--dashboard-equipos-id|/dashboard/equipos/[id]]] `belongs_to` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
