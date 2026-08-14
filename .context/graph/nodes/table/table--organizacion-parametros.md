---
id: table--organizacion-parametros
tipo: TABLE
nombre: organizacion.parametros
nivel: L2
dominio: organizacion
<<<<<<< Updated upstream
resumen: Tabla organizacion.parametros (14 columnas). Creada en 018_parametros_y_normalizacion_personal.sql, modificada por 020_asistencia.sql, 024_equipos.sql, 025_guardias.sql.
=======
resumen: Tabla organizacion.parametros (14 columnas). Creada en 018_parametros_y_normalizacion_personal.sql, modificada por 020_asistencia.sql.
>>>>>>> Stashed changes
tabla: parametros
archivos:
  - database/migrations/018_parametros_y_normalizacion_personal.sql
  - database/migrations/020_asistencia.sql
<<<<<<< Updated upstream
  - database/migrations/024_equipos.sql
  - database/migrations/025_guardias.sql
=======
>>>>>>> Stashed changes
edges:
  - [defined_in, file--018-parametros-y-normalizacion-personal]
  - [belongs_to, domain--organizacion]
terminos: [organizacion, parametros, tipo, padre, nombre, normalizado, codigo, descripcion, orden, estado, creado, actualizado, eliminado]
---

# organizacion.parametros

<<<<<<< Updated upstream
Tabla organizacion.parametros (14 columnas). Creada en 018_parametros_y_normalizacion_personal.sql, modificada por 020_asistencia.sql, 024_equipos.sql, 025_guardias.sql.
=======
Tabla organizacion.parametros (14 columnas). Creada en 018_parametros_y_normalizacion_personal.sql, modificada por 020_asistencia.sql.
>>>>>>> Stashed changes

- **Esquema:** organizacion · **Columnas:** 14

## Restricciones CHECK (reglas que la BD impone)

- `tipo IN ( 'PAIS','DEPARTAMENTO','CIUDAD','BARRIO','PROFESION','IDIOMA','NIVEL_IDIOMA', 'GRUPO_SANGUINEO','FACTOR_RH','TIPO_SEGURO','ASEGURADORA','TIPO_EVENTO_ASISTENCIA' )`
<<<<<<< Updated upstream
- `tipo IN ( 'PAIS','DEPARTAMENTO','CIUDAD','BARRIO','PROFESION','IDIOMA','NIVEL_IDIOMA', 'GRUPO_SANGUINEO','FACTOR_RH','TIPO_SEGURO','ASEGURADORA','TIPO_EVENTO_ASISTENCIA', 'UBICACION_EQUIPO' )`
- `tipo IN ( 'PAIS','DEPARTAMENTO','CIUDAD','BARRIO','PROFESION','IDIOMA','NIVEL_IDIOMA', 'GRUPO_SANGUINEO','FACTOR_RH','TIPO_SEGURO','ASEGURADORA','TIPO_EVENTO_ASISTENCIA', 'UBICACION_EQUIPO','ESTADO_PRESENCIA_GUARDIA','SECTOR_ESTACION' )`
=======
>>>>>>> Stashed changes

## Llaves foraneas

- `padre_id` → [[table--organizacion-parametros|organizacion.parametros]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| tipo | NVARCHAR(40) |
| padre_id | UNIQUEIDENTIFIER |
| nombre | NVARCHAR(200) |
| nombre_normalizado | NVARCHAR(200) |
| codigo | NVARCHAR(20) |
| descripcion | NVARCHAR(MAX) |
| orden | INT |
| estado | NVARCHAR(20) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| eliminado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |

## Archivos

- `database/migrations/018_parametros_y_normalizacion_personal.sql`
- `database/migrations/020_asistencia.sql`
<<<<<<< Updated upstream
- `database/migrations/024_equipos.sql`
- `database/migrations/025_guardias.sql`
=======
>>>>>>> Stashed changes

## Relaciones

- `defined_in` → [[file--018-parametros-y-normalizacion-personal|018_parametros_y_normalizacion_personal.sql]]
- `belongs_to` → [[domain--organizacion|Organización Institucional]]

## Referenciado por

- [[table--personal-seguros-bombero|personal.seguros_bombero]] `references` →
- [[table--personal-seguros-bombero|personal.seguros_bombero]] `references` →
- [[table--operaciones-tolerancias-asistencia|operaciones.tolerancias_asistencia]] `references` →
<<<<<<< Updated upstream
- [[table--operaciones-inspecciones-estacion|operaciones.inspecciones_estacion]] `references` →
- [[entity--parametro|Parametro]] `persisted_in` →
- [[service--equipos-equipos|EquiposService]] `reads` →
- [[service--guardias-inspecciones-estacion|InspeccionesEstacionService]] `reads` →
=======
- [[entity--parametro|Parametro]] `persisted_in` →
>>>>>>> Stashed changes
- [[service--operaciones-dashboard-asistencia|DashboardAsistenciaService]] `reads` →
- [[service--organizacion-parametros|ParametrosService]] `reads` →
- [[service--personal-foja-servicio|FojaServicioService]] `reads` →
- [[service--personal-idiomas|IdiomasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
