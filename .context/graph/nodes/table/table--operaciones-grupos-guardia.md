---
id: table--operaciones-grupos-guardia
tipo: TABLE
nombre: operaciones.grupos_guardia
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.grupos_guardia (13 columnas). Creada en 025_guardias.sql, modificada por 026_guardias_planificacion.sql.
tabla: grupos_guardia
archivos:
  - database/migrations/025_guardias.sql
  - database/migrations/026_guardias_planificacion.sql
edges:
  - [defined_in, file--025-guardias]
  - [belongs_to, domain--asistencia]
  - [references, table--personal-bomberos]
terminos: [operaciones, grupos, guardia, nombre, oficial, cargo, estado, observaciones, creado, actualizado, ciclo, rotacion, dias, cantidad, minima, maxima, oficiales, choferes]
---

# operaciones.grupos_guardia

Tabla operaciones.grupos_guardia (13 columnas). Creada en 025_guardias.sql, modificada por 026_guardias_planificacion.sql.

- **Esquema:** operaciones · **Columnas:** 13

## Llaves foraneas

- `oficial_a_cargo_id` → [[table--personal-bomberos|personal.bomberos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| nombre | NVARCHAR(150) |
| oficial_a_cargo_id | UNIQUEIDENTIFIER |
| estado | NVARCHAR(20) |
| observaciones | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| ciclo_rotacion_dias | INT |
| cantidad_minima | INT |
| cantidad_maxima | INT |
| cantidad_oficiales | INT |
| cantidad_choferes | INT |

## Donde se usa

- **Pantallas:** `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/feriados`, `/dashboard/personal/[id]`
- **Endpoints:** GruposGuardiaController, GuardiasController, OrdenesGuardiaController
- **Servicios:** GeneracionService, GruposGuardiaService, OrdenesGuardiaService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/025_guardias.sql`
- `database/migrations/026_guardias_planificacion.sql`

## Relaciones

- `defined_in` → [[file--025-guardias|025_guardias.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]
- `references` → [[table--personal-bomberos|personal.bomberos]]

## Referenciado por

- [[table--operaciones-grupos-guardia-miembros|operaciones.grupos_guardia_miembros]] `references` →
- [[entity--grupo-guardia|GrupoGuardia]] `persisted_in` →
- [[service--guardias-generacion|GeneracionService]] `reads` →
- [[service--guardias-grupos-guardia|GruposGuardiaService]] `reads` →
- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
