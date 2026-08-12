---
id: table--organizacion-departamentos
tipo: TABLE
nombre: organizacion.departamentos
nivel: L2
dominio: organizacion
resumen: Tabla organizacion.departamentos (10 columnas). Creada en 012_organizacion.sql, modificada por 012_organizacion.sql.
tabla: departamentos
archivos:
  - database/migrations/012_organizacion.sql
edges:
  - [defined_in, file--012-organizacion]
  - [belongs_to, domain--organizacion]
terminos: [organizacion, departamentos, codigo, nombre, descripcion, estado, creado, actualizado, eliminado]
---

# organizacion.departamentos

Tabla organizacion.departamentos (10 columnas). Creada en 012_organizacion.sql, modificada por 012_organizacion.sql.

- **Esquema:** organizacion · **Columnas:** 10
- **UNIQUE:** `codigo`, `nombre`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(20) |
| nombre | NVARCHAR(100) |
| descripcion | NVARCHAR(MAX) |
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

- [[entity--departamento|Departamento]] `persisted_in` →
- [[service--organizacion-dashboard|DashboardService]] `reads` →
- [[service--organizacion-departamentos|DepartamentosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
