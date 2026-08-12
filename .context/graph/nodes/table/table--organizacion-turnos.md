---
id: table--organizacion-turnos
tipo: TABLE
nombre: organizacion.turnos
nivel: L2
dominio: organizacion
resumen: Tabla organizacion.turnos (12 columnas). Creada en 012_organizacion.sql, modificada por 012_organizacion.sql.
tabla: turnos
archivos:
  - database/migrations/012_organizacion.sql
edges:
  - [defined_in, file--012-organizacion]
  - [belongs_to, domain--organizacion]
terminos: [organizacion, turnos, codigo, nombre, hora, inicio, fin, responsable, bombero, estado, creado, actualizado, eliminado]
---

# organizacion.turnos

Tabla organizacion.turnos (12 columnas). Creada en 012_organizacion.sql, modificada por 012_organizacion.sql.

- **Esquema:** organizacion · **Columnas:** 12
- **UNIQUE:** `codigo`, `nombre`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(20) |
| nombre | NVARCHAR(100) |
| hora_inicio | TIME(0) |
| hora_fin | TIME(0) |
| responsable_bombero_id | UNIQUEIDENTIFIER |
| estado | NVARCHAR(20) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| eliminado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |

## Archivos

- `database/migrations/012_organizacion.sql`

## Relaciones

- `defined_in` → [[file--012-organizacion|012_organizacion.sql]]
- `belongs_to` → [[domain--organizacion|Organización Institucional]]

## Referenciado por

- [[entity--turno|Turno]] `persisted_in` →
- [[service--organizacion-dashboard|DashboardService]] `reads` →
- [[service--organizacion-turnos|TurnosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
