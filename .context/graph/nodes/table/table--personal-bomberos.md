---
id: table--personal-bomberos
tipo: TABLE
nombre: personal.bomberos
nivel: L2
dominio: personal
resumen: Tabla personal.bomberos (71 columnas). Creada en 003_personal.sql, modificada por 009_foreign_keys.sql, 012_organizacion.sql, 016_personal_expansion.sql, 017_tipos_bombero.sql, 018_parametros_y_normalizacion_personal.sql, 026_guardias_planificacion.sql, 032_personal_autorizacion_firma.sql.
tabla: bomberos
archivos:
  - database/migrations/003_personal.sql
  - database/migrations/009_foreign_keys.sql
  - database/migrations/012_organizacion.sql
  - database/migrations/016_personal_expansion.sql
  - database/migrations/017_tipos_bombero.sql
  - database/migrations/018_parametros_y_normalizacion_personal.sql
  - database/migrations/026_guardias_planificacion.sql
  - database/migrations/032_personal_autorizacion_firma.sql
edges:
  - [defined_in, file--003-personal]
  - [belongs_to, domain--personal]
terminos: [personal, bomberos, cedula, nombre, apellido, fecha, nacimiento, sexo, nacionalidad, estado, civil, lugar, telefono, principal, secundario, email, direccion, ciudad, departamento, codigo, postal, domicilio, lat, lon, numero, bombero, rango, cargo, ingreso, ascenso, antiguedad, grupo, sanguineo, factor, alergias, condiciones, medicas, medicamentos, tipo, seguro]
---

# personal.bomberos

Tabla personal.bomberos (71 columnas). Creada en 003_personal.sql, modificada por 009_foreign_keys.sql, 012_organizacion.sql, 016_personal_expansion.sql, 017_tipos_bombero.sql, 018_parametros_y_normalizacion_personal.sql, 026_guardias_planificacion.sql, 032_personal_autorizacion_firma.sql.

- **Esquema:** personal · **Columnas:** 71
- **UNIQUE:** `cedula`, `numero_bombero`

## Restricciones CHECK (reglas que la BD impone)

- `estado IN ('ASPIRANTE','ACTIVO','SUSPENDIDO','LICENCIA','RETIRADO','FALLECIDO','HONORARIO')`
- `condicion_institucional IS NULL OR condicion_institucional IN ('INCORPORADO','COMBATIENTE','APOYO_ECONOMICO','HONORARIO')`
- `dia_preferente_guardia IN ('NINGUNA','LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO','DOMINGO')`

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
| realiza_guardias | BIT |
| realiza_guardias_especiales | BIT |
| frecuencia_normal_mensual | INT |
| frecuencia_especial_mensual | INT |
| dia_preferente_guardia | NVARCHAR(10) |
| autorizado_firma_digital | BIT |

## Donde se usa

- **Pantallas:** `/`, `/dashboard/academia`, `/dashboard/academia/[id]`, `/dashboard/academia/cursos-externos`, `/dashboard/academia/instructores-externos`, `/dashboard/asistencia`, `/dashboard/asistencia/eventos`, `/dashboard/asistencia/eventos/[id]`, `/dashboard/asistencia/externos`, `/dashboard/asistencia/registro`, `/dashboard/asistencia/tolerancias`, `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/documentos`, `/dashboard/documentos/[id]`, `/dashboard/documentos/auditoria`, `/dashboard/documentos/expedientes`, `/dashboard/documentos/expedientes/[id]`, `/dashboard/documentos/listado`, `/dashboard/documentos/plantillas`, `/dashboard/documentos/vencimientos`, `/dashboard/finanzas`, `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores`, `/dashboard/finanzas/socios-protectores/[id]`, `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/planificacion`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/ascensos`, `/dashboard/organizacion/designaciones`, `/dashboard/organizacion/documentos`, `/dashboard/organizacion/feriados`, `/dashboard/publicaciones`, `/dashboard/servicios`, `/dashboard/servicios/nuevo`
- **Endpoints:** ActividadProfesionalController, ActividadesAcademicasController, AscensosController, BitacoraController, BomberosController, CertificacionesAcademiaController, CondicionController, ConsultasAcademiaController, DesignacionesController, EspecialidadesBomberoController, EvaluacionesAcademiaController, EventosAsistenciaController, FirmasDocumentoController, FojaServicioController, GruposGuardiaController, GuardiasController, HistorialInstitucionalController, IdiomasController, ImportacionesController, InscripcionesAcademiaController, IntegracionDepositoController, MarcacionesController, NovedadesController, OrdenesGuardiaController, PernoctesController, PlantillasController, PublicacionesController, ReportesAcademiaController, ReportesFinanzasController, SegurosBomberoController, ServiciosController, SociosProtectoresController, SorteosController
- **Servicios:** ActividadProfesionalService, ActividadesAcademicasService, AscensosService, BitacoraService, BomberosService, CertificacionesAcademiaService, CondicionService, ConsultasAcademiaService, DesignacionesService, ElegibilidadService, EspecialidadesBomberoService, EvaluacionesAcademiaService, EventosAsistenciaService, FirmasDocumentoService, FojaServicioService, GeneracionService, GruposGuardiaService, GuardiasService, HistorialInstitucionalService, IaToolsService, IdiomasService, ImportacionesService, InscripcionesAcademiaService, IntegracionDepositoService, MarcacionesService, NovedadesService, OrdenesGuardiaService, PernoctesService, PlantillasService, PublicacionesService, ReportesAcademiaService, ReportesFinanzasService, SegurosBomberoService, ServiciosService, SociosProtectoresService, SorteosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/003_personal.sql`
- `database/migrations/009_foreign_keys.sql`
- `database/migrations/012_organizacion.sql`
- `database/migrations/016_personal_expansion.sql`
- `database/migrations/017_tipos_bombero.sql`
- `database/migrations/018_parametros_y_normalizacion_personal.sql`
- `database/migrations/026_guardias_planificacion.sql`
- `database/migrations/032_personal_autorizacion_firma.sql`

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
- [[table--operaciones-grupos-guardia|operaciones.grupos_guardia]] `references` →
- [[table--operaciones-grupos-guardia-miembros|operaciones.grupos_guardia_miembros]] `references` →
- [[table--operaciones-pernoctes|operaciones.pernoctes]] `references` →
- [[table--operaciones-inspecciones-estacion|operaciones.inspecciones_estacion]] `references` →
- [[table--operaciones-novedades-guardia|operaciones.novedades_guardia]] `references` →
- [[table--operaciones-sorteo-participantes|operaciones.sorteo_participantes]] `references` →
- [[table--academia-actividades|academia.actividades]] `references` →
- [[table--academia-instructores-actividad|academia.instructores_actividad]] `references` →
- [[table--academia-inscripciones|academia.inscripciones]] `references` →
- [[table--academia-evaluaciones|academia.evaluaciones]] `references` →
- [[table--deposito-tenencias|deposito.tenencias]] `references` →
- [[table--deposito-movimientos|deposito.movimientos]] `references` →
- [[table--deposito-movimientos|deposito.movimientos]] `references` →
- [[table--deposito-movimientos|deposito.movimientos]] `references` →
- [[table--deposito-bajas|deposito.bajas]] `references` →
- [[table--deposito-bajas|deposito.bajas]] `references` →
- [[table--deposito-prestamos|deposito.prestamos]] `references` →
- [[table--deposito-prestamos|deposito.prestamos]] `references` →
- [[table--deposito-inventarios-fisicos|deposito.inventarios_fisicos]] `references` →
- [[table--deposito-mantenimientos|deposito.mantenimientos]] `references` →
- [[table--finanzas-cajas|finanzas.cajas]] `references` →
- [[table--finanzas-cuentas-bancarias|finanzas.cuentas_bancarias]] `references` →
- [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]] `references` →
- [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]] `references` →
- [[table--finanzas-cuotas|finanzas.cuotas]] `references` →
- [[table--documentos-firmas-documento|documentos.firmas_documento]] `references` →
- [[table--finanzas-socios-protectores|finanzas.socios_protectores]] `references` →
- [[entity--bombero|Bombero]] `persisted_in` →
- [[service--academia-actividades-academicas|ActividadesAcademicasService]] `reads` →
- [[service--academia-certificaciones-academia|CertificacionesAcademiaService]] `reads` →
- [[service--academia-consultas-academia|ConsultasAcademiaService]] `reads` →
- [[service--academia-evaluaciones-academia|EvaluacionesAcademiaService]] `reads` →
- [[service--academia-inscripciones-academia|InscripcionesAcademiaService]] `reads` →
- [[service--academia-reportes-academia|ReportesAcademiaService]] `reads` →
- [[service--deposito-integracion-deposito|IntegracionDepositoService]] `reads` →
- [[service--documentos-firmas-documento|FirmasDocumentoService]] `reads` →
- [[service--documentos-plantillas|PlantillasService]] `reads` →
- [[service--finanzas-reportes-finanzas|ReportesFinanzasService]] `reads` →
- [[service--finanzas-socios-protectores|SociosProtectoresService]] `reads` →
- [[service--guardias-bitacora|BitacoraService]] `reads` →
- [[service--guardias-elegibilidad|ElegibilidadService]] `reads` →
- [[service--guardias-generacion|GeneracionService]] `reads` →
- [[service--guardias-grupos-guardia|GruposGuardiaService]] `reads` →
- [[service--guardias-guardias|GuardiasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
