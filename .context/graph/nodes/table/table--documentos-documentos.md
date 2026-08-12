---
id: table--documentos-documentos
tipo: TABLE
nombre: documentos.documentos
nivel: L2
dominio: documentos
resumen: Tabla documentos.documentos (17 columnas). Creada en 008_admin.sql, modificada por 009_foreign_keys.sql.
tabla: documentos
archivos:
  - database/migrations/008_admin.sql
  - database/migrations/009_foreign_keys.sql
edges:
  - [defined_in, file--008-admin]
  - [belongs_to, domain--documentos]
terminos: [documentos, tipo, titulo, contenido, fecha, emision, vencimiento, numero, oficial, bombero, servicio, estado, archivo, url, firmado, firma, digital, metadata, creado, actualizado]
---

# documentos.documentos

Tabla documentos.documentos (17 columnas). Creada en 008_admin.sql, modificada por 009_foreign_keys.sql.

- **Esquema:** documentos · **Columnas:** 17

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| tipo | NVARCHAR(50) |
| titulo | NVARCHAR(200) |
| contenido | NVARCHAR(MAX) |
| fecha_emision | DATE |
| fecha_vencimiento | DATE |
| numero_oficial | NVARCHAR(100) |
| bombero_id | UNIQUEIDENTIFIER |
| servicio_id | UNIQUEIDENTIFIER |
| estado | NVARCHAR(20) |
| archivo_url | NVARCHAR(MAX) |
| archivo_firmado_url | NVARCHAR(MAX) |
| firma_digital | BIT |
| metadata | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Archivos

- `database/migrations/008_admin.sql`
- `database/migrations/009_foreign_keys.sql`

## Relaciones

- `defined_in` → [[file--008-admin|008_admin.sql]]
- `belongs_to` → [[domain--documentos|Documentos]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
