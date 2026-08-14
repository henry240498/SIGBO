---
id: table--equipos-equipos
tipo: TABLE
nombre: equipos.equipos
nivel: L2
dominio: equipos
<<<<<<< Updated upstream
resumen: Tabla equipos.equipos (22 columnas). Creada en 006_vehiculos_equipos.sql, modificada por 009_foreign_keys.sql, 024_equipos.sql.
=======
resumen: Tabla equipos.equipos (20 columnas). Creada en 006_vehiculos_equipos.sql, modificada por 009_foreign_keys.sql.
>>>>>>> Stashed changes
tabla: equipos
archivos:
  - database/migrations/006_vehiculos_equipos.sql
  - database/migrations/009_foreign_keys.sql
<<<<<<< Updated upstream
  - database/migrations/024_equipos.sql
edges:
  - [defined_in, file--006-vehiculos-equipos]
  - [belongs_to, domain--equipos]
terminos: [equipos, categoria, codigo, interno, nombre, descripcion, marca, modelo, numero, serie, estado, ubicacion, responsable, fecha, compra, vencimiento, vida, util, meses, code, fotos, documentos, metadata, creado, actualizado, vehiculo, asignado, tipo]
=======
edges:
  - [defined_in, file--006-vehiculos-equipos]
  - [belongs_to, domain--equipos]
terminos: [equipos, categoria, codigo, interno, nombre, descripcion, marca, modelo, numero, serie, estado, ubicacion, responsable, fecha, compra, vencimiento, vida, util, meses, code, fotos, documentos, metadata, creado, actualizado]
>>>>>>> Stashed changes
---

# equipos.equipos

<<<<<<< Updated upstream
Tabla equipos.equipos (22 columnas). Creada en 006_vehiculos_equipos.sql, modificada por 009_foreign_keys.sql, 024_equipos.sql.

- **Esquema:** equipos · **Columnas:** 22
=======
Tabla equipos.equipos (20 columnas). Creada en 006_vehiculos_equipos.sql, modificada por 009_foreign_keys.sql.

- **Esquema:** equipos · **Columnas:** 20
>>>>>>> Stashed changes
- **UNIQUE:** `codigo_interno`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| categoria_id | UNIQUEIDENTIFIER |
| codigo_interno | NVARCHAR(50) |
| nombre | NVARCHAR(200) |
| descripcion | NVARCHAR(MAX) |
| marca | NVARCHAR(100) |
| modelo | NVARCHAR(100) |
| numero_serie | NVARCHAR(100) |
| estado | NVARCHAR(20) |
| ubicacion | NVARCHAR(200) |
| responsable_id | UNIQUEIDENTIFIER |
| fecha_compra | DATE |
| fecha_vencimiento | DATE |
| vida_util_meses | INT |
| qr_code | NVARCHAR(200) |
| fotos | NVARCHAR(MAX) |
| documentos | NVARCHAR(MAX) |
| metadata | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
<<<<<<< Updated upstream
| vehiculo_asignado_id | UNIQUEIDENTIFIER |
| ubicacion_tipo | UNIQUEIDENTIFIER |
=======
>>>>>>> Stashed changes

## Archivos

- `database/migrations/006_vehiculos_equipos.sql`
- `database/migrations/009_foreign_keys.sql`
<<<<<<< Updated upstream
- `database/migrations/024_equipos.sql`
=======
>>>>>>> Stashed changes

## Relaciones

- `defined_in` → [[file--006-vehiculos-equipos|006_vehiculos_equipos.sql]]
- `belongs_to` → [[domain--equipos|Equipos]]

## Referenciado por

- [[entity--equipo|Equipo]] `persisted_in` →
- [[service--equipos-equipamiento-bombero|EquipamientoBomberoService]] `reads` →
- [[service--equipos-equipos|EquiposService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
