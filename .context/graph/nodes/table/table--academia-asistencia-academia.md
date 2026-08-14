---
id: table--academia-asistencia-academia
tipo: TABLE
nombre: academia.asistencia_academia
nivel: L2
dominio: academia
resumen: Tabla academia.asistencia_academia (9 columnas). Creada en 004_academia.sql, modificada por 009_foreign_keys.sql.
tabla: asistencia_academia
archivos:
  - database/migrations/004_academia.sql
  - database/migrations/009_foreign_keys.sql
edges:
  - [defined_in, file--004-academia]
  - [belongs_to, domain--academia]
terminos: [academia, asistencia, inscripcion, fecha, presente, justificado, motivo, marcado, creado, actualizado]
---

# academia.asistencia_academia

Tabla academia.asistencia_academia (9 columnas). Creada en 004_academia.sql, modificada por 009_foreign_keys.sql.

- **Esquema:** academia · **Columnas:** 9
- **UNIQUE:** `inscripcion_id, fecha`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| inscripcion_id | UNIQUEIDENTIFIER |
| fecha | DATE |
| presente | BIT |
| justificado | BIT |
| motivo | NVARCHAR(MAX) |
| marcado_por | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/004_academia.sql`
- `database/migrations/009_foreign_keys.sql`

## Relaciones

- `defined_in` → [[file--004-academia|004_academia.sql]]
- `belongs_to` → [[domain--academia|Academia]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
