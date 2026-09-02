---
id: table--operaciones-sorteo-participantes
tipo: TABLE
nombre: operaciones.sorteo_participantes
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.sorteo_participantes (5 columnas). Creada en 028_guardias_sorteo.sql.
tabla: sorteo_participantes
archivos:
  - database/migrations/028_guardias_sorteo.sql
edges:
  - [defined_in, file--028-guardias-sorteo]
  - [belongs_to, domain--asistencia]
  - [references, table--operaciones-sorteos-guardia]
  - [references, table--personal-bomberos]
terminos: [operaciones, sorteo, participantes, bombero, seleccionado, orden]
---

# operaciones.sorteo_participantes

Tabla operaciones.sorteo_participantes (5 columnas). Creada en 028_guardias_sorteo.sql.

- **Esquema:** operaciones · **Columnas:** 5

## Llaves foraneas

- `sorteo_id` → [[table--operaciones-sorteos-guardia|operaciones.sorteos_guardia]]
- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| sorteo_id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| seleccionado | BIT |
| orden | INT |

## Donde se usa

- **Pantallas:** `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/planificacion`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/feriados`
- **Endpoints:** SorteosController
- **Servicios:** SorteosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/028_guardias_sorteo.sql`

## Relaciones

- `defined_in` → [[file--028-guardias-sorteo|028_guardias_sorteo.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]
- `references` → [[table--operaciones-sorteos-guardia|operaciones.sorteos_guardia]]
- `references` → [[table--personal-bomberos|personal.bomberos]]

## Referenciado por

- [[entity--sorteo-participante|SorteoParticipante]] `persisted_in` →
- [[service--guardias-sorteos|SorteosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
