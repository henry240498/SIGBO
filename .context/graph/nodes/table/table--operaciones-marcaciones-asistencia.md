---
id: table--operaciones-marcaciones-asistencia
tipo: TABLE
nombre: operaciones.marcaciones_asistencia
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.marcaciones_asistencia (22 columnas). Creada en 005_operaciones.sql, modificada por 009_foreign_keys.sql, 020_asistencia.sql.
tabla: marcaciones_asistencia
archivos:
  - database/migrations/005_operaciones.sql
  - database/migrations/009_foreign_keys.sql
  - database/migrations/020_asistencia.sql
edges:
  - [defined_in, file--005-operaciones]
  - [belongs_to, domain--asistencia]
terminos: [operaciones, marcaciones, asistencia, evento, bombero, tipo, marcacion, metodo, timestamp, latitud, longitud, precision, metros, dispositivo, observaciones, verificado, creado, fuente, registrado, motivo, importacion, dato, original, codigo, excel, fila]
---

# operaciones.marcaciones_asistencia

Tabla operaciones.marcaciones_asistencia (22 columnas). Creada en 005_operaciones.sql, modificada por 009_foreign_keys.sql, 020_asistencia.sql.

- **Esquema:** operaciones · **Columnas:** 22

## Restricciones CHECK (reglas que la BD impone)

- `fuente IN ('MARCADOR_DIGITAL','MANUAL','IMPORTACION_EXCEL','EVENTO','GUARDIA','OTRO')`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| evento_id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| tipo_marcacion | NVARCHAR(20) |
| metodo | NVARCHAR(20) |
| timestamp_marcacion | DATETIMEOFFSET(3) |
| latitud | DECIMAL(10,8) |
| longitud | DECIMAL(11,8) |
| precision_metros | INT |
| dispositivo | NVARCHAR(100) |
| ip | VARCHAR(45) |
| observaciones | NVARCHAR(MAX) |
| verificado | BIT |
| verificado_por | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| fuente | NVARCHAR(30) |
| registrado_por | UNIQUEIDENTIFIER |
| motivo | NVARCHAR(MAX) |
| importacion_id | UNIQUEIDENTIFIER |
| dato_original | NVARCHAR(MAX) |
| codigo_original_excel | NVARCHAR(50) |
| fila_excel | INT |

## Archivos

- `database/migrations/005_operaciones.sql`
- `database/migrations/009_foreign_keys.sql`
- `database/migrations/020_asistencia.sql`

## Relaciones

- `defined_in` → [[file--005-operaciones|005_operaciones.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]

## Referenciado por

- [[entity--marcacion-asistencia|MarcacionAsistencia]] `persisted_in` →
<<<<<<< Updated upstream
- [[service--guardias-guardias|GuardiasService]] `reads` →
=======
>>>>>>> Stashed changes
- [[service--operaciones-eventos-asistencia|EventosAsistenciaService]] `reads` →
- [[service--operaciones-importaciones|ImportacionesService]] `reads` →
- [[service--operaciones-marcaciones|MarcacionesService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
