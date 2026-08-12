---
id: table--academia-materias
tipo: TABLE
nombre: academia.materias
nivel: L2
dominio: academia
resumen: Tabla academia.materias (12 columnas). Creada en 004_academia.sql.
tabla: materias
archivos:
  - database/migrations/004_academia.sql
edges:
  - [defined_in, file--004-academia]
  - [belongs_to, domain--academia]
terminos: [academia, materias, codigo, nombre, descripcion, nivel, horas, teoricas, practicas, totales, requiere, nota, aprobacion, creado, actualizado]
---

# academia.materias

Tabla academia.materias (12 columnas). Creada en 004_academia.sql.

- **Esquema:** academia · **Columnas:** 12
- **UNIQUE:** `codigo`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(20) |
| nombre | NVARCHAR(200) |
| descripcion | NVARCHAR(MAX) |
| nivel | NVARCHAR(20) |
| horas_teoricas | INT |
| horas_practicas | INT |
| horas_totales | AS |
| requiere_practicas | BIT |
| nota_aprobacion | DECIMAL(5,2) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |

## Archivos

- `database/migrations/004_academia.sql`

## Relaciones

- `defined_in` → [[file--004-academia|004_academia.sql]]
- `belongs_to` → [[domain--academia|Academia]]

## Referenciado por

- [[entity--materia|Materia]] `persisted_in` →
- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
