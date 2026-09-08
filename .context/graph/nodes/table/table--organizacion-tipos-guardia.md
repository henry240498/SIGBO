---
id: table--organizacion-tipos-guardia
tipo: TABLE
nombre: organizacion.tipos_guardia
nivel: L2
dominio: organizacion
resumen: Tabla organizacion.tipos_guardia (11 columnas). Creada en 012_organizacion.sql, modificada por 012_organizacion.sql.
tabla: tipos_guardia
archivos:
  - database/migrations/012_organizacion.sql
edges:
  - [defined_in, file--012-organizacion]
  - [belongs_to, domain--organizacion]
terminos: [organizacion, tipos, guardia, codigo, nombre, duracion, horas, descripcion, estado, creado, actualizado, eliminado]
---

# organizacion.tipos_guardia

Tabla organizacion.tipos_guardia (11 columnas). Creada en 012_organizacion.sql, modificada por 012_organizacion.sql.

- **Esquema:** organizacion · **Columnas:** 11
- **UNIQUE:** `codigo`, `nombre`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(20) |
| nombre | NVARCHAR(100) |
| duracion_horas | INT |
| descripcion | NVARCHAR(MAX) |
| estado | NVARCHAR(20) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| eliminado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/organizacion/tipos-guardia`
- **Endpoints:** TiposGuardiaController
- **Servicios:** DashboardService, TiposGuardiaService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/012_organizacion.sql`

## Relaciones

- `defined_in` → [[file--012-organizacion|012_organizacion.sql]]
- `belongs_to` → [[domain--organizacion|Organización Institucional]]

## Referenciado por

- [[entity--tipo-guardia|TipoGuardia]] `persisted_in` →
- [[service--organizacion-dashboard|DashboardService]] `reads` →
- [[service--organizacion-tipos-guardia|TiposGuardiaService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
