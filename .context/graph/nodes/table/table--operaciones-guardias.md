---
id: table--operaciones-guardias
tipo: TABLE
nombre: operaciones.guardias
nivel: L2
dominio: asistencia
<<<<<<< Updated upstream
resumen: Tabla operaciones.guardias (17 columnas). Creada en 005_operaciones.sql, modificada por 009_foreign_keys.sql, 020_asistencia.sql, 025_guardias.sql.
=======
resumen: Tabla operaciones.guardias (12 columnas). Creada en 005_operaciones.sql, modificada por 009_foreign_keys.sql, 020_asistencia.sql.
>>>>>>> Stashed changes
tabla: guardias
archivos:
  - database/migrations/005_operaciones.sql
  - database/migrations/009_foreign_keys.sql
  - database/migrations/020_asistencia.sql
<<<<<<< Updated upstream
  - database/migrations/025_guardias.sql
edges:
  - [defined_in, file--005-operaciones]
  - [belongs_to, domain--asistencia]
terminos: [operaciones, guardias, fecha, turno, hora, inicio, fin, tipo, estado, jefe, guardia, observaciones, creado, actualizado, institucion, grupo, cierre, responsable, observacion, resumen, cerrada]
=======
edges:
  - [defined_in, file--005-operaciones]
  - [belongs_to, domain--asistencia]
terminos: [operaciones, guardias, fecha, turno, hora, inicio, fin, tipo, estado, jefe, guardia, observaciones, creado, actualizado, institucion]
>>>>>>> Stashed changes
---

# operaciones.guardias

<<<<<<< Updated upstream
Tabla operaciones.guardias (17 columnas). Creada en 005_operaciones.sql, modificada por 009_foreign_keys.sql, 020_asistencia.sql, 025_guardias.sql.

- **Esquema:** operaciones · **Columnas:** 17

## Restricciones CHECK (reglas que la BD impone)

- `cierre_resumen IS NULL OR ISJSON(cierre_resumen) = 1`
=======
Tabla operaciones.guardias (12 columnas). Creada en 005_operaciones.sql, modificada por 009_foreign_keys.sql, 020_asistencia.sql.

- **Esquema:** operaciones · **Columnas:** 12
>>>>>>> Stashed changes

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| fecha | DATE |
| turno | NVARCHAR(20) |
| hora_inicio | TIME(0) |
| hora_fin | TIME(0) |
| tipo | NVARCHAR(20) |
| estado | NVARCHAR(20) |
| jefe_guardia_id | UNIQUEIDENTIFIER |
| observaciones | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| institucion_id | UNIQUEIDENTIFIER |
<<<<<<< Updated upstream
| grupo_guardia_id | UNIQUEIDENTIFIER |
| cierre_responsable_id | UNIQUEIDENTIFIER |
| cierre_observacion | NVARCHAR(MAX) |
| cierre_resumen | NVARCHAR(MAX) |
| cerrada_en | DATETIMEOFFSET(3) |
=======
>>>>>>> Stashed changes

## Archivos

- `database/migrations/005_operaciones.sql`
- `database/migrations/009_foreign_keys.sql`
- `database/migrations/020_asistencia.sql`
<<<<<<< Updated upstream
- `database/migrations/025_guardias.sql`
=======
>>>>>>> Stashed changes

## Relaciones

- `defined_in` → [[file--005-operaciones|005_operaciones.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]

## Referenciado por

<<<<<<< Updated upstream
- [[table--operaciones-pernoctes|operaciones.pernoctes]] `references` →
- [[table--operaciones-inspecciones-estacion|operaciones.inspecciones_estacion]] `references` →
- [[table--operaciones-novedades-guardia|operaciones.novedades_guardia]] `references` →
- [[entity--guardia|Guardia]] `persisted_in` →
- [[service--guardias-guardias|GuardiasService]] `reads` →
- [[service--guardias-inspecciones-estacion|InspeccionesEstacionService]] `reads` →
- [[service--guardias-novedades|NovedadesService]] `reads` →
- [[service--operaciones-dashboard-asistencia|DashboardAsistenciaService]] `reads` →
=======
- [[entity--guardia|Guardia]] `persisted_in` →
- [[service--operaciones-dashboard-asistencia|DashboardAsistenciaService]] `reads` →
- [[service--operaciones-guardias|GuardiasService]] `reads` →
>>>>>>> Stashed changes
- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
