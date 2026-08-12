---
id: table--academia-cursos
tipo: TABLE
nombre: academia.cursos
nivel: L2
dominio: academia
resumen: Tabla academia.cursos (14 columnas). Creada en 004_academia.sql, modificada por 009_foreign_keys.sql.
tabla: cursos
archivos:
  - database/migrations/004_academia.sql
  - database/migrations/009_foreign_keys.sql
edges:
  - [defined_in, file--004-academia]
  - [belongs_to, domain--academia]
terminos: [academia, cursos, materia, nombre, descripcion, fecha, inicio, fin, horario, instructor, cupo, maximo, actual, estado, metadata, creado, actualizado]
---

# academia.cursos

Tabla academia.cursos (14 columnas). Creada en 004_academia.sql, modificada por 009_foreign_keys.sql.

- **Esquema:** academia · **Columnas:** 14

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| materia_id | UNIQUEIDENTIFIER |
| nombre | NVARCHAR(200) |
| descripcion | NVARCHAR(MAX) |
| fecha_inicio | DATE |
| fecha_fin | DATE |
| horario | NVARCHAR(100) |
| instructor_id | UNIQUEIDENTIFIER |
| cupo_maximo | INT |
| cupo_actual | INT |
| estado | NVARCHAR(20) |
| metadata | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |

## Archivos

- `database/migrations/004_academia.sql`
- `database/migrations/009_foreign_keys.sql`

## Relaciones

- `defined_in` → [[file--004-academia|004_academia.sql]]
- `belongs_to` → [[domain--academia|Academia]]

## Referenciado por

- [[entity--curso|Curso]] `persisted_in` →
- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
