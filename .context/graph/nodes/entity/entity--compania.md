---
id: entity--compania
tipo: ENTITY
nombre: Compania
nivel: L1
dominio: organizacion
resumen: Entidad Compania, persistida en organizacion.companias.
tabla: organizacion.companias
archivos:
  - backend/src/shared/entities/compania.entity.ts
edges:
  - [belongs_to, domain--organizacion]
  - [persisted_in, table--organizacion-companias]
terminos: [compania, companias, organizacion]
---

# Compania

Entidad Compania, persistida en organizacion.companias.

- **Tabla:** [[table--organizacion-companias|organizacion.companias]]
- **Columnas mapeadas:** 9

## Archivos

- `backend/src/shared/entities/compania.entity.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `persisted_in` → [[table--organizacion-companias|organizacion.companias]]

## Referenciado por

- [[service--organizacion-companias|CompaniasService]] `uses` →
- [[service--organizacion-dashboard|DashboardService]] `uses` →
- [[service--organizacion-designaciones|DesignacionesService]] `uses` →
- [[service--personal-foja-servicio|FojaServicioService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
