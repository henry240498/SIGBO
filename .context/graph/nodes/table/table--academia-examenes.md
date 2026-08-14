---
id: table--academia-examenes
tipo: TABLE
nombre: academia.examenes
nivel: L2
dominio: academia
resumen: Tabla academia.examenes (12 columnas). Creada en 004_academia.sql, modificada por 009_foreign_keys.sql.
tabla: examenes
archivos:
  - database/migrations/004_academia.sql
  - database/migrations/009_foreign_keys.sql
edges:
  - [defined_in, file--004-academia]
  - [belongs_to, domain--academia]
terminos: [academia, examenes, curso, tipo, titulo, descripcion, fecha, hora, duracion, minutos, nota, maxima, minima, aprobacion, creado, actualizado]
---

# academia.examenes

Tabla academia.examenes (12 columnas). Creada en 004_academia.sql, modificada por 009_foreign_keys.sql.

- **Esquema:** academia · **Columnas:** 12

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| curso_id | UNIQUEIDENTIFIER |
| tipo | NVARCHAR(20) |
| titulo | NVARCHAR(200) |
| descripcion | NVARCHAR(MAX) |
| fecha | DATE |
| hora | TIME(0) |
| duracion_minutos | INT |
| nota_maxima | DECIMAL(5,2) |
| nota_minima_aprobacion | DECIMAL(5,2) |
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
