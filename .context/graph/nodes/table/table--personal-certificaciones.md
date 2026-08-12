---
id: table--personal-certificaciones
tipo: TABLE
nombre: personal.certificaciones
nivel: L2
dominio: personal
resumen: Tabla personal.certificaciones (14 columnas). Creada en 003_personal.sql, modificada por 009_foreign_keys.sql, 016_personal_expansion.sql.
tabla: certificaciones
archivos:
  - database/migrations/003_personal.sql
  - database/migrations/009_foreign_keys.sql
  - database/migrations/016_personal_expansion.sql
edges:
  - [defined_in, file--003-personal]
  - [belongs_to, domain--personal]
terminos: [personal, certificaciones, bombero, tipo, nombre, institucion, fecha, obtencion, vencimiento, numero, certificado, archivo, url, estado, creado, actualizado, duracion, horas, instructor]
---

# personal.certificaciones

Tabla personal.certificaciones (14 columnas). Creada en 003_personal.sql, modificada por 009_foreign_keys.sql, 016_personal_expansion.sql.

- **Esquema:** personal · **Columnas:** 14

## Restricciones CHECK (reglas que la BD impone)

- `tipo IN ('BASICO','INTERMEDIO','AVANZADO','ESPECIALIDAD','CURSO','SEMINARIO','TALLER','ENTRENAMIENTO')`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| tipo | NVARCHAR(50) |
| nombre | NVARCHAR(200) |
| institucion | NVARCHAR(200) |
| fecha_obtencion | DATE |
| fecha_vencimiento | DATE |
| numero_certificado | NVARCHAR(100) |
| archivo_url | NVARCHAR(MAX) |
| estado | NVARCHAR(20) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| duracion_horas | INT |
| instructor | NVARCHAR(150) |

## Archivos

- `database/migrations/003_personal.sql`
- `database/migrations/009_foreign_keys.sql`
- `database/migrations/016_personal_expansion.sql`

## Relaciones

- `defined_in` → [[file--003-personal|003_personal.sql]]
- `belongs_to` → [[domain--personal|Personal]]

## Referenciado por

- [[entity--certificacion|Certificacion]] `persisted_in` →
- [[service--personal-foja-servicio|FojaServicioService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
