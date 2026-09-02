---
id: table--operaciones-sorteos-guardia
tipo: TABLE
nombre: operaciones.sorteos_guardia
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.sorteos_guardia (9 columnas). Creada en 028_guardias_sorteo.sql.
tabla: sorteos_guardia
archivos:
  - database/migrations/028_guardias_sorteo.sql
edges:
  - [defined_in, file--028-guardias-sorteo]
  - [belongs_to, domain--asistencia]
  - [references, table--operaciones-esquemas-horario-guardia]
  - [references, table--operaciones-guardias]
terminos: [operaciones, sorteos, guardia, fecha, motivo, cantidad, seleccionar, esquema, horario, ejecutado, observacion]
---

# operaciones.sorteos_guardia

Tabla operaciones.sorteos_guardia (9 columnas). Creada en 028_guardias_sorteo.sql.

- **Esquema:** operaciones · **Columnas:** 9

## Llaves foraneas

- `esquema_horario_id` → [[table--operaciones-esquemas-horario-guardia|operaciones.esquemas_horario_guardia]]
- `guardia_id` → [[table--operaciones-guardias|operaciones.guardias]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| fecha | DATE |
| motivo | NVARCHAR(300) |
| cantidad_a_seleccionar | INT |
| esquema_horario_id | UNIQUEIDENTIFIER |
| guardia_id | UNIQUEIDENTIFIER |
| ejecutado_por | UNIQUEIDENTIFIER |
| ejecutado_en | DATETIMEOFFSET(3) |
| observacion | NVARCHAR(MAX) |

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
- `references` → [[table--operaciones-esquemas-horario-guardia|operaciones.esquemas_horario_guardia]]
- `references` → [[table--operaciones-guardias|operaciones.guardias]]

## Referenciado por

- [[table--operaciones-sorteo-participantes|operaciones.sorteo_participantes]] `references` →
- [[entity--sorteo-guardia|SorteoGuardia]] `persisted_in` →
- [[service--guardias-sorteos|SorteosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
