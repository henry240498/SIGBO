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

## Donde se usa

- **Pantallas:** `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/feriados`, `/dashboard/organizacion/guardias/planificacion`, `/dashboard/personal/[id]`
- **Endpoints:** GruposGuardiaController, GuardiasController, OrdenesGuardiaController
- **Servicios:** GeneracionService, GruposGuardiaService, GuardiasService, OrdenesGuardiaService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/grupo-guardia-miembro.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-grupos-guardia-miembros|operaciones.grupos_guardia_miembros]]

## Referenciado por

- [[service--guardias-generacion|GeneracionService]] `uses` →
- [[service--guardias-grupos-guardia|GruposGuardiaService]] `uses` →
- [[service--guardias-guardias|GuardiasService]] `uses` →
- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
