---
id: entity--rango
tipo: ENTITY
nombre: Rango
nivel: L1
dominio: organizacion
resumen: Entidad Rango, persistida en organizacion.rangos.
tabla: organizacion.rangos
archivos:
  - backend/src/shared/entities/rango.entity.ts
edges:
  - [belongs_to, domain--organizacion]
  - [persisted_in, table--organizacion-rangos]
terminos: [rango, rangos, organizacion]
---

# Rango

Entidad Rango, persistida en organizacion.rangos.

- **Tabla:** [[table--organizacion-rangos|organizacion.rangos]]
- **Columnas mapeadas:** 12

## Archivos

- `backend/src/shared/entities/rango.entity.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `persisted_in` → [[table--organizacion-rangos|organizacion.rangos]]

## Referenciado por

- [[service--organizacion-ascensos|AscensosService]] `uses` →
- [[service--organizacion-dashboard|DashboardService]] `uses` →
- [[service--organizacion-rangos|RangosService]] `uses` →
- [[service--personal-foja-servicio|FojaServicioService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
