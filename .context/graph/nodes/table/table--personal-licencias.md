---
id: table--personal-licencias
tipo: TABLE
nombre: personal.licencias
nivel: L2
dominio: personal
resumen: Tabla personal.licencias (10 columnas). Creada en 003_personal.sql, modificada por 009_foreign_keys.sql.
tabla: licencias
archivos:
  - database/migrations/003_personal.sql
  - database/migrations/009_foreign_keys.sql
edges:
  - [defined_in, file--003-personal]
  - [belongs_to, domain--personal]
terminos: [personal, licencias, bombero, tipo, numero, fecha, emision, vencimiento, estado, archivo, url, creado, actualizado]
---

# personal.licencias

Tabla personal.licencias (10 columnas). Creada en 003_personal.sql, modificada por 009_foreign_keys.sql.

- **Esquema:** personal · **Columnas:** 10

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| tipo | NVARCHAR(50) |
| numero | NVARCHAR(50) |
| fecha_emision | DATE |
| fecha_vencimiento | DATE |
| estado | NVARCHAR(20) |
| archivo_url | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/003_personal.sql`
- `database/migrations/009_foreign_keys.sql`

## Relaciones

- `defined_in` → [[file--003-personal|003_personal.sql]]
- `belongs_to` → [[domain--personal|Personal]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
