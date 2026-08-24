---
id: table--organizacion-parametros
tipo: TABLE
nombre: organizacion.parametros
nivel: L2
dominio: organizacion
resumen: Tabla organizacion.parametros (14 columnas). Creada en 018_parametros_y_normalizacion_personal.sql, modificada por 020_asistencia.sql, 024_equipos.sql, 025_guardias.sql, 036_academia_estructura.sql, 041_deposito_estructura.sql, 043_deposito_bajas.sql, 044_deposito_prestamos.sql, 048_finanzas_estructura.sql, 052_documentos_estructura.sql, 062_finanzas_socios_protectores.sql.
tabla: parametros
archivos:
  - database/migrations/018_parametros_y_normalizacion_personal.sql
  - database/migrations/020_asistencia.sql
  - database/migrations/024_equipos.sql
  - database/migrations/025_guardias.sql
  - database/migrations/036_academia_estructura.sql
  - database/migrations/041_deposito_estructura.sql
  - database/migrations/043_deposito_bajas.sql
  - database/migrations/044_deposito_prestamos.sql
  - database/migrations/048_finanzas_estructura.sql
  - database/migrations/052_documentos_estructura.sql
  - database/migrations/062_finanzas_socios_protectores.sql
edges:
  - [defined_in, file--018-parametros-y-normalizacion-personal]
  - [belongs_to, domain--organizacion]
terminos: [organizacion, parametros, tipo, padre, nombre, normalizado, codigo, descripcion, orden, estado, creado, actualizado, eliminado]
---

# organizacion.parametros

Tabla organizacion.parametros (14 columnas). Creada en 018_parametros_y_normalizacion_personal.sql, modificada por 020_asistencia.sql, 024_equipos.sql, 025_guardias.sql, 036_academia_estructura.sql, 041_deposito_estructura.sql, 043_deposito_bajas.sql, 044_deposito_prestamos.sql, 048_finanzas_estructura.sql, 052_documentos_estructura.sql, 062_finanzas_socios_protectores.sql.

- **Esquema:** organizacion · **Columnas:** 14

## Restricciones CHECK (reglas que la BD impone)

- `tipo IN ( 'PAIS','DEPARTAMENTO','CIUDAD','BARRIO','PROFESION','IDIOMA','NIVEL_IDIOMA', 'GRUPO_SANGUINEO','FACTOR_RH','TIPO_SEGURO','ASEGURADORA','TIPO_EVENTO_ASISTENCIA' )`
- `tipo IN ( 'PAIS','DEPARTAMENTO','CIUDAD','BARRIO','PROFESION','IDIOMA','NIVEL_IDIOMA', 'GRUPO_SANGUINEO','FACTOR_RH','TIPO_SEGURO','ASEGURADORA','TIPO_EVENTO_ASISTENCIA', 'UBICACION_EQUIPO' )`
- `tipo IN ( 'PAIS','DEPARTAMENTO','CIUDAD','BARRIO','PROFESION','IDIOMA','NIVEL_IDIOMA', 'GRUPO_SANGUINEO','FACTOR_RH','TIPO_SEGURO','ASEGURADORA','TIPO_EVENTO_ASISTENCIA', 'UBICACION_EQUIPO','ESTADO_PRESENCIA_GUARDIA','SECTOR_ESTACION' )`
- `tipo IN ( N'PAIS', N'DEPARTAMENTO', N'CIUDAD', N'BARRIO', N'PROFESION', N'IDIOMA', N'NIVEL_IDIOMA', N'GRUPO_SANGUINEO', N'FACTOR_RH', N'TIPO_SEGURO', N'ASEGURADORA', N'TIPO_EVENTO_ASISTENCIA', N'UBICACION_EQUIPO', N'ESTADO_PRESENCIA_GUARDIA', N'SECTOR_ESTACION', N'TIPO_ACTIVIDAD_ACADEMICA', N'MODALIDAD_ACADEMICA', N'TIPO_EVALUACION_ACADEMICA', N'RESULTADO_ACADEMICO' )`
- `tipo IN ( N'PAIS', N'DEPARTAMENTO', N'CIUDAD', N'BARRIO', N'PROFESION', N'IDIOMA', N'NIVEL_IDIOMA', N'GRUPO_SANGUINEO', N'FACTOR_RH', N'TIPO_SEGURO', N'ASEGURADORA', N'TIPO_EVENTO_ASISTENCIA', N'UBICACION_EQUIPO', N'ESTADO_PRESENCIA_GUARDIA', N'SECTOR_ESTACION', N'TIPO_ACTIVIDAD_ACADEMICA', N'MODALIDAD_ACADEMICA', N'TIPO_EVALUACION_ACADEMICA', N'RESULTADO_ACADEMICO', N'TIPO_UBICACION_DEPOSITO', N'TIPO_TENENCIA_DEPOSITO', N'ESTADO_ELEMENTO_DEPOSITO', N'TIPO_MOVIMIENTO_DEPOSITO', N'UNIDAD_MEDIDA_DEPOSITO' )`
- `tipo IN ( N'PAIS', N'DEPARTAMENTO', N'CIUDAD', N'BARRIO', N'PROFESION', N'IDIOMA', N'NIVEL_IDIOMA', N'GRUPO_SANGUINEO', N'FACTOR_RH', N'TIPO_SEGURO', N'ASEGURADORA', N'TIPO_EVENTO_ASISTENCIA', N'UBICACION_EQUIPO', N'ESTADO_PRESENCIA_GUARDIA', N'SECTOR_ESTACION', N'TIPO_ACTIVIDAD_ACADEMICA', N'MODALIDAD_ACADEMICA', N'TIPO_EVALUACION_ACADEMICA', N'RESULTADO_ACADEMICO', N'TIPO_UBICACION_DEPOSITO', N'TIPO_TENENCIA_DEPOSITO', N'ESTADO_ELEMENTO_DEPOSITO', N'TIPO_MOVIMIENTO_DEPOSITO', N'UNIDAD_MEDIDA_DEPOSITO', N'MOTIVO_BAJA_DEPOSITO' )`
- `tipo IN ( N'PAIS', N'DEPARTAMENTO', N'CIUDAD', N'BARRIO', N'PROFESION', N'IDIOMA', N'NIVEL_IDIOMA', N'GRUPO_SANGUINEO', N'FACTOR_RH', N'TIPO_SEGURO', N'ASEGURADORA', N'TIPO_EVENTO_ASISTENCIA', N'UBICACION_EQUIPO', N'ESTADO_PRESENCIA_GUARDIA', N'SECTOR_ESTACION', N'TIPO_ACTIVIDAD_ACADEMICA', N'MODALIDAD_ACADEMICA', N'TIPO_EVALUACION_ACADEMICA', N'RESULTADO_ACADEMICO', N'TIPO_UBICACION_DEPOSITO', N'TIPO_TENENCIA_DEPOSITO', N'ESTADO_ELEMENTO_DEPOSITO', N'TIPO_MOVIMIENTO_DEPOSITO', N'UNIDAD_MEDIDA_DEPOSITO', N'MOTIVO_BAJA_DEPOSITO', N'TIPO_PRESTAMO_DEPOSITO' )`
- `tipo IN ( N'PAIS', N'DEPARTAMENTO', N'CIUDAD', N'BARRIO', N'PROFESION', N'IDIOMA', N'NIVEL_IDIOMA', N'GRUPO_SANGUINEO', N'FACTOR_RH', N'TIPO_SEGURO', N'ASEGURADORA', N'TIPO_EVENTO_ASISTENCIA', N'UBICACION_EQUIPO', N'ESTADO_PRESENCIA_GUARDIA', N'SECTOR_ESTACION', N'TIPO_ACTIVIDAD_ACADEMICA', N'MODALIDAD_ACADEMICA', N'TIPO_EVALUACION_ACADEMICA', N'RESULTADO_ACADEMICO', N'TIPO_UBICACION_DEPOSITO', N'TIPO_TENENCIA_DEPOSITO', N'ESTADO_ELEMENTO_DEPOSITO', N'TIPO_MOVIMIENTO_DEPOSITO', N'UNIDAD_MEDIDA_DEPOSITO', N'MOTIVO_BAJA_DEPOSITO', N'TIPO_PRESTAMO_DEPOSITO', N'TIPO_INGRESO_FINANZAS', N'CATEGORIA_EGRESO_FINANZAS', N'TIPO_CUENTA_BANCARIA_FINANZAS', N'TIPO_DOCUMENTO_FINANZAS', N'MOTIVO_ANULACION_FINANZAS' )`
- `tipo IN ( N'PAIS', N'DEPARTAMENTO', N'CIUDAD', N'BARRIO', N'PROFESION', N'IDIOMA', N'NIVEL_IDIOMA', N'GRUPO_SANGUINEO', N'FACTOR_RH', N'TIPO_SEGURO', N'ASEGURADORA', N'TIPO_EVENTO_ASISTENCIA', N'UBICACION_EQUIPO', N'ESTADO_PRESENCIA_GUARDIA', N'SECTOR_ESTACION', N'TIPO_ACTIVIDAD_ACADEMICA', N'MODALIDAD_ACADEMICA', N'TIPO_EVALUACION_ACADEMICA', N'RESULTADO_ACADEMICO', N'TIPO_UBICACION_DEPOSITO', N'TIPO_TENENCIA_DEPOSITO', N'ESTADO_ELEMENTO_DEPOSITO', N'TIPO_MOVIMIENTO_DEPOSITO', N'UNIDAD_MEDIDA_DEPOSITO', N'MOTIVO_BAJA_DEPOSITO', N'TIPO_PRESTAMO_DEPOSITO', N'TIPO_INGRESO_FINANZAS', N'CATEGORIA_EGRESO_FINANZAS', N'TIPO_CUENTA_BANCARIA_FINANZAS', N'TIPO_DOCUMENTO_FINANZAS', N'MOTIVO_ANULACION_FINANZAS', N'TIPO_DOCUMENTO', N'CATEGORIA_DOCUMENTO', N'ESTADO_DOCUMENTO', N'NIVEL_CONFIDENCIALIDAD_DOCUMENTO', N'MOTIVO_ANULACION_DOCUMENTO', N'ARCHIVO_FISICO_DOCUMENTO' )`
- `tipo IN ( N'PAIS', N'DEPARTAMENTO', N'CIUDAD', N'BARRIO', N'PROFESION', N'IDIOMA', N'NIVEL_IDIOMA', N'GRUPO_SANGUINEO', N'FACTOR_RH', N'TIPO_SEGURO', N'ASEGURADORA', N'TIPO_EVENTO_ASISTENCIA', N'UBICACION_EQUIPO', N'ESTADO_PRESENCIA_GUARDIA', N'SECTOR_ESTACION', N'TIPO_ACTIVIDAD_ACADEMICA', N'MODALIDAD_ACADEMICA', N'TIPO_EVALUACION_ACADEMICA', N'RESULTADO_ACADEMICO', N'TIPO_UBICACION_DEPOSITO', N'TIPO_TENENCIA_DEPOSITO', N'ESTADO_ELEMENTO_DEPOSITO', N'TIPO_MOVIMIENTO_DEPOSITO', N'UNIDAD_MEDIDA_DEPOSITO', N'MOTIVO_BAJA_DEPOSITO', N'TIPO_PRESTAMO_DEPOSITO', N'TIPO_INGRESO_FINANZAS', N'CATEGORIA_EGRESO_FINANZAS', N'TIPO_CUENTA_BANCARIA_FINANZAS', N'TIPO_DOCUMENTO_FINANZAS', N'MOTIVO_ANULACION_FINANZAS', N'TIPO_DOCUMENTO', N'CATEGORIA_DOCUMENTO', N'ESTADO_DOCUMENTO', N'NIVEL_CONFIDENCIALIDAD_DOCUMENTO', N'MOTIVO_ANULACION_DOCUMENTO', N'ARCHIVO_FISICO_DOCUMENTO', N'ESTADO_SOCIO_PROTECTOR', N'PERIODICIDAD_APORTE', N'MEDIO_PAGO_FINANZAS', N'TIPO_BENEFICIO_SOCIO', N'MOTIVO_NOTA_CREDITO_FINANZAS' )`

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

## Donde se usa

- **Pantallas:** `/dashboard/academia`, `/dashboard/academia/[id]`, `/dashboard/academia/cursos-externos`, `/dashboard/academia/instructores-externos`, `/dashboard/asistencia`, `/dashboard/asistencia/eventos`, `/dashboard/asistencia/eventos/[id]`, `/dashboard/asistencia/externos`, `/dashboard/asistencia/registro`, `/dashboard/asistencia/tolerancias`, `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/documentos`, `/dashboard/documentos/[id]`, `/dashboard/documentos/auditoria`, `/dashboard/documentos/expedientes`, `/dashboard/documentos/expedientes/[id]`, `/dashboard/documentos/listado`, `/dashboard/documentos/plantillas`, `/dashboard/documentos/vencimientos`, `/dashboard/equipos`, `/dashboard/equipos/[id]`, `/dashboard/equipos/categorias`, `/dashboard/finanzas`, `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores`, `/dashboard/finanzas/socios-protectores/[id]`, `/dashboard/guardias/[id]`, `/dashboard/organizacion/documentos`, `/dashboard/organizacion/parametros`, `/dashboard/personal/[id]`, `/dashboard/personal/nuevo`
- **Endpoints:** AportesController, BeneficiosSociosController, ConsultasAcademiaController, ConsultasCruzadasController, ConsultasDepositoController, ConsultasDocumentosController, ConsultasFinanzasController, CuotasController, DashboardAsistenciaController, DashboardDocumentosController, DashboardFinanzasController, DocumentosController, EquiposController, EvaluacionesAcademiaController, FojaServicioController, IdiomasController, InscripcionesAcademiaController, InspeccionesEstacionController, IntegracionFinanzasController, MovimientosDepositoController, MovimientosFinancierosController, ParametrosController, PlantillasController, ReportesAcademiaController, ReportesFinanzasController
- **Servicios:** AportesService, BeneficiosSociosService, ConsultasAcademiaService, ConsultasCruzadasService, ConsultasDepositoService, ConsultasDocumentosService, ConsultasFinanzasService, CuotasService, DashboardAsistenciaService, DashboardDocumentosService, DashboardFinanzasService, DocumentosService, EquiposService, EvaluacionesAcademiaService, FojaServicioService, IaToolsService, IdiomasService, InscripcionesAcademiaService, InspeccionesEstacionService, IntegracionFinanzasService, MovimientosDepositoService, MovimientosFinancierosService, ParametrosService, PlantillasService, ReportesAcademiaService, ReportesFinanzasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/018_parametros_y_normalizacion_personal.sql`
- `database/migrations/020_asistencia.sql`
- `database/migrations/024_equipos.sql`
- `database/migrations/025_guardias.sql`
- `database/migrations/036_academia_estructura.sql`
- `database/migrations/041_deposito_estructura.sql`
- `database/migrations/043_deposito_bajas.sql`
- `database/migrations/044_deposito_prestamos.sql`
- `database/migrations/048_finanzas_estructura.sql`
- `database/migrations/052_documentos_estructura.sql`
- `database/migrations/062_finanzas_socios_protectores.sql`

## Relaciones

- `defined_in` → [[file--018-parametros-y-normalizacion-personal|018_parametros_y_normalizacion_personal.sql]]
- `belongs_to` → [[domain--organizacion|Organización Institucional]]

## Referenciado por

- [[table--personal-seguros-bombero|personal.seguros_bombero]] `references` →
- [[table--personal-seguros-bombero|personal.seguros_bombero]] `references` →
- [[table--operaciones-tolerancias-asistencia|operaciones.tolerancias_asistencia]] `references` →
- [[table--operaciones-inspecciones-estacion|operaciones.inspecciones_estacion]] `references` →
- [[table--academia-actividades|academia.actividades]] `references` →
- [[table--academia-actividades|academia.actividades]] `references` →
- [[table--academia-inscripciones|academia.inscripciones]] `references` →
- [[table--academia-evaluaciones|academia.evaluaciones]] `references` →
- [[table--academia-notas-evaluacion|academia.notas_evaluacion]] `references` →
- [[table--deposito-articulos|deposito.articulos]] `references` →
- [[table--deposito-ubicaciones|deposito.ubicaciones]] `references` →
- [[table--deposito-tenencias|deposito.tenencias]] `references` →
- [[table--deposito-tenencias|deposito.tenencias]] `references` →
- [[table--deposito-movimientos|deposito.movimientos]] `references` →
- [[table--deposito-entradas|deposito.entradas]] `references` →
- [[table--deposito-bajas|deposito.bajas]] `references` →
- [[table--deposito-prestamos|deposito.prestamos]] `references` →
- [[table--finanzas-cuentas-bancarias|finanzas.cuentas_bancarias]] `references` →
- [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]] `references` →
- [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]] `references` →
- [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]] `references` →
- [[table--finanzas-documentos-respaldo|finanzas.documentos_respaldo]] `references` →
- [[table--finanzas-presupuestos|finanzas.presupuestos]] `references` →
- [[table--finanzas-ordenes-pago|finanzas.ordenes_pago]] `references` →
- [[table--documentos-numeraciones|documentos.numeraciones]] `references` →
- [[table--documentos-documentos-institucionales|documentos.documentos_institucionales]] `references` →
- [[table--documentos-documentos-institucionales|documentos.documentos_institucionales]] `references` →
- [[table--documentos-documentos-institucionales|documentos.documentos_institucionales]] `references` →
- [[table--documentos-documentos-institucionales|documentos.documentos_institucionales]] `references` →
- [[table--documentos-documentos-institucionales|documentos.documentos_institucionales]] `references` →
- [[table--documentos-documentos-institucionales|documentos.documentos_institucionales]] `references` →
- [[table--documentos-plantillas|documentos.plantillas]] `references` →
- [[table--finanzas-socios-protectores|finanzas.socios_protectores]] `references` →
- [[table--finanzas-socios-protectores|finanzas.socios_protectores]] `references` →
- [[table--finanzas-socios-protectores|finanzas.socios_protectores]] `references` →
- [[table--finanzas-socios-protectores|finanzas.socios_protectores]] `references` →
- [[table--finanzas-socios-protectores|finanzas.socios_protectores]] `references` →
- [[table--finanzas-acuerdos-aporte|finanzas.acuerdos_aporte]] `references` →
- [[table--finanzas-acuerdos-aporte|finanzas.acuerdos_aporte]] `references` →
- [[table--finanzas-aportes|finanzas.aportes]] `references` →
- [[table--finanzas-beneficios-socios|finanzas.beneficios_socios]] `references` →
- [[table--finanzas-numeraciones-comprobantes|finanzas.numeraciones_comprobantes]] `references` →
- [[table--finanzas-facturas|finanzas.facturas]] `references` →
- [[table--finanzas-facturas|finanzas.facturas]] `references` →
- [[table--finanzas-notas-credito|finanzas.notas_credito]] `references` →
- [[entity--parametro|Parametro]] `persisted_in` →
- [[service--academia-consultas-academia|ConsultasAcademiaService]] `reads` →
- [[service--academia-evaluaciones-academia|EvaluacionesAcademiaService]] `reads` →
- [[service--academia-inscripciones-academia|InscripcionesAcademiaService]] `reads` →
- [[service--academia-reportes-academia|ReportesAcademiaService]] `reads` →
- [[service--deposito-consultas-deposito|ConsultasDepositoService]] `reads` →
- [[service--deposito-movimientos-deposito|MovimientosDepositoService]] `reads` →
- [[service--documentos-consultas-documentos|ConsultasDocumentosService]] `reads` →
- [[service--documentos-dashboard-documentos|DashboardDocumentosService]] `reads` →
- [[service--documentos-documentos|DocumentosService]] `reads` →
- [[service--documentos-plantillas|PlantillasService]] `reads` →
- [[service--equipos-equipos|EquiposService]] `reads` →
- [[service--finanzas-aportes|AportesService]] `reads` →
- [[service--finanzas-beneficios-socios|BeneficiosSociosService]] `reads` →
- [[service--finanzas-consultas-finanzas|ConsultasFinanzasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
