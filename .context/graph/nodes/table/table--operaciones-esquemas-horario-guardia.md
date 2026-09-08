---
id: table--operaciones-esquemas-horario-guardia
tipo: TABLE
nombre: operaciones.esquemas_horario_guardia
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.esquemas_horario_guardia (18 columnas). Creada en 026_guardias_planificacion.sql, modificada por 027_guardias_generacion.sql.
tabla: esquemas_horario_guardia
archivos:
  - database/migrations/026_guardias_planificacion.sql
  - database/migrations/027_guardias_generacion.sql
edges:
  - [defined_in, file--026-guardias-planificacion]
  - [belongs_to, domain--asistencia]
terminos: [operaciones, esquemas, horario, guardia, nombre, dias, semana, csv, hora, inicio, fin, cruza, medianoche, duracion, especial, requiere, oficial, chofer, cantidad, minima, maxima, oficiales, choferes, orden, activo, creado, usa, rotacion, grupo]
---

# operaciones.esquemas_horario_guardia

Tabla operaciones.esquemas_horario_guardia (18 columnas). Creada en 026_guardias_planificacion.sql, modificada por 027_guardias_generacion.sql.

- **Esquema:** operaciones · **Columnas:** 18

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| nombre | NVARCHAR(150) |
| dias_semana_csv | NVARCHAR(30) |
| hora_inicio | TIME(0) |
| hora_fin | TIME(0) |
| cruza_medianoche | BIT |
| dias_duracion | INT |
| es_especial | BIT |
| requiere_oficial | BIT |
| requiere_chofer | BIT |
| cantidad_minima | INT |
| cantidad_maxima | INT |
| cantidad_oficiales | INT |
| cantidad_choferes | INT |
| orden | INT |
| activo | BIT |
| creado_en | DATETIMEOFFSET(3) |
| usa_rotacion_grupo | BIT |

## Donde se usa

- **Pantallas:** `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/planificacion`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/feriados`
- **Endpoints:** EsquemasHorarioController, GuardiasController, OrdenesGuardiaController, SorteosController
- **Servicios:** EsquemasHorarioService, GeneracionService, OrdenesGuardiaService, SorteosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/026_guardias_planificacion.sql`
- `database/migrations/027_guardias_generacion.sql`

## Relaciones

- `defined_in` → [[file--026-guardias-planificacion|026_guardias_planificacion.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]

## Referenciado por

- [[table--operaciones-sorteos-guardia|operaciones.sorteos_guardia]] `references` →
- [[entity--esquema-horario-guardia|EsquemaHorarioGuardia]] `persisted_in` →
- [[service--guardias-esquemas-horario|EsquemasHorarioService]] `reads` →
- [[service--guardias-generacion|GeneracionService]] `reads` →
- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `reads` →
- [[service--guardias-sorteos|SorteosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
