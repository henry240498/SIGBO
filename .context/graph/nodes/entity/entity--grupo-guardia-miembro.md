---
id: entity--grupo-guardia-miembro
tipo: ENTITY
nombre: GrupoGuardiaMiembro
nivel: L1
dominio: asistencia
resumen: Entidad GrupoGuardiaMiembro, persistida en operaciones.grupos_guardia_miembros.
tabla: operaciones.grupos_guardia_miembros
archivos:
  - backend/src/shared/entities/grupo-guardia-miembro.entity.ts
edges:
  - [belongs_to, domain--asistencia]
  - [persisted_in, table--operaciones-grupos-guardia-miembros]
terminos: [grupo, guardia, miembro, grupos, miembros, operaciones, rol, titular, chofer]
---

# GrupoGuardiaMiembro

Entidad GrupoGuardiaMiembro, persistida en operaciones.grupos_guardia_miembros.

- **Tabla:** [[table--operaciones-grupos-guardia-miembros|operaciones.grupos_guardia_miembros]]
- **Columnas mapeadas:** 4

## Estados y enumeraciones

- `RolGrupoGuardia`: `TITULAR` · `CHOFER`

## Archivos

- `backend/src/shared/entities/grupo-guardia-miembro.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-grupos-guardia-miembros|operaciones.grupos_guardia_miembros]]

## Referenciado por

- [[service--guardias-grupos-guardia|GruposGuardiaService]] `uses` →
- [[service--guardias-guardias|GuardiasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
