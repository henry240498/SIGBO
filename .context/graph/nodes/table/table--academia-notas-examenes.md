---
id: table--academia-notas-examenes
tipo: TABLE
nombre: academia.notas_examenes
nivel: L2
dominio: academia
resumen: Tabla academia.notas_examenes (8 columnas). Creada en 004_academia.sql, modificada por 009_foreign_keys.sql.
tabla: notas_examenes
archivos:
  - database/migrations/004_academia.sql
  - database/migrations/009_foreign_keys.sql
edges:
  - [defined_in, file--004-academia]
  - [belongs_to, domain--academia]
terminos: [academia, notas, examenes, examen, inscripcion, nota, observaciones, estado, creado, actualizado]
---

# academia.notas_examenes

Tabla academia.notas_examenes (8 columnas). Creada en 004_academia.sql, modificada por 009_foreign_keys.sql.

- **Esquema:** academia · **Columnas:** 8
- **UNIQUE:** `examen_id, inscripcion_id`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| examen_id | UNIQUEIDENTIFIER |
| inscripcion_id | UNIQUEIDENTIFIER |
| nota | DECIMAL(5,2) |
| observaciones | NVARCHAR(MAX) |
| estado | NVARCHAR(20) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |

## Archivos

- `database/migrations/004_academia.sql`
- `database/migrations/009_foreign_keys.sql`

## Relaciones

- `defined_in` → [[file--004-academia|004_academia.sql]]
- `belongs_to` → [[domain--academia|Academia]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
