---
id: table--personal-historial-medico
tipo: TABLE
nombre: personal.historial_medico
nivel: L2
dominio: personal
resumen: Tabla personal.historial_medico (12 columnas). Creada en 003_personal.sql, modificada por 009_foreign_keys.sql.
tabla: historial_medico
archivos:
  - database/migrations/003_personal.sql
  - database/migrations/009_foreign_keys.sql
edges:
  - [defined_in, file--003-personal]
  - [belongs_to, domain--personal]
terminos: [personal, historial, medico, bombero, fecha, tipo, diagnostico, tratamiento, institucion, archivo, url, observaciones, creado]
---

# personal.historial_medico

Tabla personal.historial_medico (12 columnas). Creada en 003_personal.sql, modificada por 009_foreign_keys.sql.

- **Esquema:** personal · **Columnas:** 12

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| fecha | DATE |
| tipo | NVARCHAR(50) |
| diagnostico | NVARCHAR(MAX) |
| tratamiento | NVARCHAR(MAX) |
| medico | NVARCHAR(100) |
| institucion | NVARCHAR(200) |
| archivo_url | NVARCHAR(MAX) |
| observaciones | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Archivos

- `database/migrations/003_personal.sql`
- `database/migrations/009_foreign_keys.sql`

## Relaciones

- `defined_in` → [[file--003-personal|003_personal.sql]]
- `belongs_to` → [[domain--personal|Personal]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
