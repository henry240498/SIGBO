---
id: entity--tipo-guardia
tipo: ENTITY
nombre: TipoGuardia
nivel: L1
dominio: organizacion
resumen: Catalogo de tipos de guardia (24hs, 12hs, Nocturna...). No confundir con operaciones.guardias, que son las guardias programadas reales.
tabla: organizacion.tipos_guardia
archivos:
  - backend/src/shared/entities/tipo-guardia.entity.ts
edges:
  - [belongs_to, domain--organizacion]
  - [persisted_in, table--organizacion-tipos-guardia]
terminos: [tipo, guardia, tipos, organizacion]
---

# TipoGuardia

Catalogo de tipos de guardia (24hs, 12hs, Nocturna...). No confundir con operaciones.guardias, que son las guardias programadas reales.

- **Tabla:** [[table--organizacion-tipos-guardia|organizacion.tipos_guardia]]
- **Columnas mapeadas:** 8

## Archivos

- `backend/src/shared/entities/tipo-guardia.entity.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `persisted_in` → [[table--organizacion-tipos-guardia|organizacion.tipos_guardia]]

## Referenciado por

- [[service--organizacion-dashboard|DashboardService]] `uses` →
- [[service--organizacion-tipos-guardia|TiposGuardiaService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
