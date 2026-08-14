---
id: table--academia-aspirantes
tipo: TABLE
nombre: academia.aspirantes
nivel: L2
dominio: academia
resumen: Tabla academia.aspirantes (15 columnas). Creada en 004_academia.sql.
tabla: aspirantes
archivos:
  - database/migrations/004_academia.sql
edges:
  - [defined_in, file--004-academia]
  - [belongs_to, domain--academia]
terminos: [academia, aspirantes, cedula, nombre, apellido, fecha, nacimiento, telefono, email, direccion, estado, inscripcion, inicio, fin, observaciones, creado, actualizado]
---

# academia.aspirantes

Tabla academia.aspirantes (15 columnas). Creada en 004_academia.sql.

- **Esquema:** academia · **Columnas:** 15
- **UNIQUE:** `cedula`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| cedula | NVARCHAR(20) |
| nombre | NVARCHAR(100) |
| apellido | NVARCHAR(100) |
| fecha_nacimiento | DATE |
| telefono | NVARCHAR(20) |
| email | NVARCHAR(255) |
| direccion | NVARCHAR(MAX) |
| estado | NVARCHAR(20) |
| fecha_inscripcion | DATE |
| fecha_inicio | DATE |
| fecha_fin | DATE |
| observaciones | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/004_academia.sql`

## Relaciones

- `defined_in` → [[file--004-academia|004_academia.sql]]
- `belongs_to` → [[domain--academia|Academia]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
