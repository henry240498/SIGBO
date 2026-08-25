---
id: entity--grupo-guardia
tipo: ENTITY
nombre: GrupoGuardia
nivel: L1
dominio: asistencia
resumen: "Composicion predefinida de un grupo de guardia (seccion 3 del pedido): al crear una guardia real a partir de un grupo, el sistema recupera automaticamente su personal titular sin tener que volver a cargarlo."
tabla: operaciones.grupos_guardia
archivos:
  - backend/src/shared/entities/grupo-guardia.entity.ts
edges:
  - [belongs_to, domain--asistencia]
  - [persisted_in, table--operaciones-grupos-guardia]
terminos: [grupo, guardia, grupos, operaciones, estado, activo, inactivo]
---

# GrupoGuardia

Composicion predefinida de un grupo de guardia (seccion 3 del pedido): al crear una guardia real a partir de un grupo, el sistema recupera automaticamente su personal titular sin tener que volver a cargarlo.

- **Tabla:** [[table--operaciones-grupos-guardia|operaciones.grupos_guardia]]
- **Columnas mapeadas:** 11

## Estados y enumeraciones

- `EstadoGrupoGuardia`: `ACTIVO` · `INACTIVO`

## Donde se usa

- **Pantallas:** `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/feriados`, `/dashboard/organizacion/guardias/planificacion`, `/dashboard/personal/[id]`
- **Endpoints:** GruposGuardiaController, GuardiasController, OrdenesGuardiaController
- **Servicios:** GeneracionService, GruposGuardiaService, GuardiasService, OrdenesGuardiaService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/grupo-guardia.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-grupos-guardia|operaciones.grupos_guardia]]

## Referenciado por

- [[service--guardias-generacion|GeneracionService]] `uses` →
- [[service--guardias-grupos-guardia|GruposGuardiaService]] `uses` →
- [[service--guardias-guardias|GuardiasService]] `uses` →
- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `uses` →
- [[rule--guardias-vive-en-operaciones|Guardias es un modulo propio cuyas tablas viven en el esquema operaciones]] `affects` →
- [[workflow--guardia-y-pernocte|Operacion de una guardia: grupos, asignaciones, presencia, novedades y pernoctes]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
