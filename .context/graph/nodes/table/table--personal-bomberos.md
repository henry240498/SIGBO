---
id: table--personal-bomberos
tipo: TABLE
nombre: personal.bomberos
nivel: L2
dominio: personal
resumen: Tabla personal.bomberos (65 columnas). Creada en 003_personal.sql, modificada por 009_foreign_keys.sql, 012_organizacion.sql, 016_personal_expansion.sql, 017_tipos_bombero.sql, 018_parametros_y_normalizacion_personal.sql.
tabla: bomberos
archivos:
  - database/migrations/003_personal.sql
  - database/migrations/009_foreign_keys.sql
  - database/migrations/012_organizacion.sql
  - database/migrations/016_personal_expansion.sql
  - database/migrations/017_tipos_bombero.sql
  - database/migrations/018_parametros_y_normalizacion_personal.sql
edges:
  - [defined_in, file--003-personal]
  - [belongs_to, domain--personal]
terminos: [personal, bomberos, cedula, nombre, apellido, fecha, nacimiento, sexo, nacionalidad, estado, civil, lugar, telefono, principal, secundario, email, direccion, ciudad, departamento, codigo, postal, domicilio, lat, lon, numero, bombero, rango, cargo, ingreso, ascenso, antiguedad, grupo, sanguineo, factor, alergias, condiciones, medicas, medicamentos, tipo, seguro]
---

# personal.bomberos

Tabla personal.bomberos (65 columnas). Creada en 003_personal.sql, modificada por 009_foreign_keys.sql, 012_organizacion.sql, 016_personal_expansion.sql, 017_tipos_bombero.sql, 018_parametros_y_normalizacion_personal.sql.

- **Esquema:** personal · **Columnas:** 65
- **UNIQUE:** `cedula`, `numero_bombero`

## Restricciones CHECK (reglas que la BD impone)

- `estado IN ('ASPIRANTE','ACTIVO','SUSPENDIDO','LICENCIA','RETIRADO','FALLECIDO','HONORARIO')`
- `condicion_institucional IS NULL OR condicion_institucional IN ('INCORPORADO','COMBATIENTE','APOYO_ECONOMICO','HONORARIO')`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| cedula | NVARCHAR(20) |
| nombre | NVARCHAR(100) |
| apellido | NVARCHAR(100) |
| fecha_nacimiento | DATE |
| sexo | NVARCHAR(1) |
| nacionalidad | NVARCHAR(50) |
| estado_civil | NVARCHAR(20) |
| lugar_nacimiento | NVARCHAR(100) |
| telefono_principal | NVARCHAR(20) |
| telefono_secundario | NVARCHAR(20) |
| email | NVARCHAR(255) |
| direccion | NVARCHAR(MAX) |
| ciudad | NVARCHAR(100) |
| departamento | NVARCHAR(100) |
| codigo_postal | NVARCHAR(20) |
| domicilio_lat | DECIMAL(10,8) |
| domicilio_lon | DECIMAL(11,8) |
| numero_bombero | NVARCHAR(20) |
| rango | NVARCHAR(50) |
| cargo | NVARCHAR(100) |
| estado | NVARCHAR(20) |
| fecha_ingreso | DATE |
| fecha_ascenso | DATE |
| antiguedad | AS |
| grupo_sanguineo | NVARCHAR(5) |
| factor_rh | NVARCHAR(2) |
| alergias | NVARCHAR(MAX) |
| condiciones_medicas | NVARCHAR(MAX) |
| medicamentos | NVARCHAR(MAX) |
| tipo_seguro | NVARCHAR(50) |
| numero_seguro | NVARCHAR(50) |
| vigencia_seguro | DATE |
| contactos_emergencia | NVARCHAR(MAX) |
| foto_url | NVARCHAR(MAX) |
| foto_thumb_url | NVARCHAR(MAX) |
| fecha_baja | DATE |
| motivo_baja | NVARCHAR(MAX) |
| metadata | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |
| rango_id | UNIQUEIDENTIFIER |
| cargo_principal_id | UNIQUEIDENTIFIER |
| compania_id | UNIQUEIDENTIFIER |
| cuartel_id | UNIQUEIDENTIFIER |
| turno_id | UNIQUEIDENTIFIER |
| tipo_guardia_id | UNIQUEIDENTIFIER |
| condicion_institucional | NVARCHAR(30) |
| brigada_id | UNIQUEIDENTIFIER |
| departamento_id | UNIQUEIDENTIFIER |
| unidad_id | UNIQUEIDENTIFIER |
| barrio | NVARCHAR(100) |
| pasaporte | NVARCHAR(30) |
| fecha_incorporacion | DATE |
| fecha_juramento | DATE |
| firma_digital_url | NVARCHAR(MAX) |
| tipo_bombero_id | UNIQUEIDENTIFIER |
| pais_id | UNIQUEIDENTIFIER |
| departamento_residencia_id | UNIQUEIDENTIFIER |
| ciudad_id | UNIQUEIDENTIFIER |
| barrio_id | UNIQUEIDENTIFIER |
| grupo_sanguineo_id | UNIQUEIDENTIFIER |
| factor_rh_id | UNIQUEIDENTIFIER |

## Archivos

- `database/migrations/003_personal.sql`
- `database/migrations/009_foreign_keys.sql`
- `database/migrations/012_organizacion.sql`
- `database/migrations/016_personal_expansion.sql`
- `database/migrations/017_tipos_bombero.sql`
- `database/migrations/018_parametros_y_normalizacion_personal.sql`

## Relaciones

- `defined_in` → [[file--003-personal|003_personal.sql]]
- `belongs_to` → [[domain--personal|Personal]]

## Referenciado por

- [[table--organizacion-designaciones|organizacion.designaciones]] `references` →
- [[table--organizacion-ascensos|organizacion.ascensos]] `references` →
- [[table--personal-bombero-especialidades|personal.bombero_especialidades]] `references` →
- [[table--personal-historial-codigo|personal.historial_codigo]] `references` →
- [[table--personal-condicion-incorporado|personal.condicion_incorporado]] `references` →
- [[table--personal-condicion-combatiente|personal.condicion_combatiente]] `references` →
- [[table--personal-condicion-apoyo-economico|personal.condicion_apoyo_economico]] `references` →
- [[table--personal-condicion-honorario|personal.condicion_honorario]] `references` →
- [[table--personal-historial-institucional|personal.historial_institucional]] `references` →
- [[table--personal-actividad-profesional|personal.actividad_profesional]] `references` →
- [[table--personal-idiomas-bombero|personal.idiomas_bombero]] `references` →
- [[table--personal-vehiculos-autorizados|personal.vehiculos_autorizados]] `references` →
- [[table--personal-fojas-servicio|personal.fojas_servicio]] `references` →
- [[table--personal-seguros-bombero|personal.seguros_bombero]] `references` →
- [[table--operaciones-participantes-evento|operaciones.participantes_evento]] `references` →
- [[table--operaciones-importaciones-marcador-filas|operaciones.importaciones_marcador_filas]] `references` →
<<<<<<< Updated upstream
- [[table--operaciones-grupos-guardia|operaciones.grupos_guardia]] `references` →
- [[table--operaciones-grupos-guardia-miembros|operaciones.grupos_guardia_miembros]] `references` →
- [[table--operaciones-pernoctes|operaciones.pernoctes]] `references` →
- [[table--operaciones-inspecciones-estacion|operaciones.inspecciones_estacion]] `references` →
- [[table--operaciones-novedades-guardia|operaciones.novedades_guardia]] `references` →
- [[entity--bombero|Bombero]] `persisted_in` →
- [[service--guardias-elegibilidad|ElegibilidadService]] `reads` →
- [[service--guardias-grupos-guardia|GruposGuardiaService]] `reads` →
- [[service--guardias-guardias|GuardiasService]] `reads` →
- [[service--guardias-novedades|NovedadesService]] `reads` →
- [[service--guardias-pernoctes|PernoctesService]] `reads` →
- [[service--operaciones-eventos-asistencia|EventosAsistenciaService]] `reads` →
=======
- [[entity--bombero|Bombero]] `persisted_in` →
- [[service--operaciones-eventos-asistencia|EventosAsistenciaService]] `reads` →
- [[service--operaciones-guardias|GuardiasService]] `reads` →
>>>>>>> Stashed changes
- [[service--operaciones-importaciones|ImportacionesService]] `reads` →
- [[service--operaciones-marcaciones|MarcacionesService]] `reads` →
- [[service--organizacion-ascensos|AscensosService]] `reads` →
- [[service--organizacion-designaciones|DesignacionesService]] `reads` →
- [[service--personal-actividad-profesional|ActividadProfesionalService]] `reads` →
- [[service--personal-bomberos|BomberosService]] `reads` →
- [[service--personal-condicion|CondicionService]] `reads` →
- [[service--personal-especialidades-bombero|EspecialidadesBomberoService]] `reads` →
- [[service--personal-foja-servicio|FojaServicioService]] `reads` →
- [[service--personal-historial-institucional|HistorialInstitucionalService]] `reads` →
- [[service--personal-idiomas|IdiomasService]] `reads` →
- [[service--personal-seguros-bombero|SegurosBomberoService]] `reads` →
- [[service--publicaciones-publicaciones|PublicacionesService]] `reads` →
- [[service--servicios-servicios|ServiciosService]] `reads` →
- [[rule--cedula-y-numero-bombero-unicos|Cedula y numero de bombero son unicos en toda la institucion]] `affects` →
- [[rule--identidad-y-tiempo-en-sql-server|PK UNIQUEIDENTIFIER con NEWSEQUENTIALID y tiempos en DATETIMEOFFSET(3)]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
