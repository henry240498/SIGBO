---
id: entity--parametro
tipo: ENTITY
nombre: Parametro
nivel: L1
dominio: organizacion
resumen: "Catalogo generico de valores parametrizables administrados desde Organizacion Institucional -> Parametros. `padreId` solo se usa en la jerarquia geografica (DEPARTAMENTO->PAIS, CIUDAD->DEPARTAMENTO, BARRIO->CIUDAD); el resto de los tipos son planos."
tabla: organizacion.parametros
archivos:
  - backend/src/shared/entities/parametro.entity.ts
edges:
  - [belongs_to, domain--organizacion]
  - [persisted_in, table--organizacion-parametros]
terminos: [parametro, parametros, organizacion, tipo, pais, departamento, ciudad, barrio, profesion, idioma, nivel, grupo, sanguineo, factor, seguro, aseguradora, evento, asistencia, ubicacion, equipo, estado, presencia, guardia, sector, estacion, actividad, academica, modalidad, evaluacion, resultado, academico, deposito, tenencia, elemento, movimiento, unidad, medida, motivo, baja, prestamo]
---

# Parametro

Catalogo generico de valores parametrizables administrados desde Organizacion Institucional -> Parametros. `padreId` solo se usa en la jerarquia geografica (DEPARTAMENTO->PAIS, CIUDAD->DEPARTAMENTO, BARRIO->CIUDAD); el resto de los tipos son planos.

- **Tabla:** [[table--organizacion-parametros|organizacion.parametros]]
- **Columnas mapeadas:** 11

## Estados y enumeraciones

- `TipoParametro`: `PAIS` · `DEPARTAMENTO` · `CIUDAD` · `BARRIO` · `PROFESION` · `IDIOMA` · `NIVEL_IDIOMA` · `GRUPO_SANGUINEO` · `FACTOR_RH` · `TIPO_SEGURO` · `ASEGURADORA` · `TIPO_EVENTO_ASISTENCIA` · `UBICACION_EQUIPO` · `ESTADO_PRESENCIA_GUARDIA` · `SECTOR_ESTACION` · `TIPO_ACTIVIDAD_ACADEMICA` · `MODALIDAD_ACADEMICA` · `TIPO_EVALUACION_ACADEMICA` · `RESULTADO_ACADEMICO` · `TIPO_UBICACION_DEPOSITO` · `TIPO_TENENCIA_DEPOSITO` · `ESTADO_ELEMENTO_DEPOSITO` · `TIPO_MOVIMIENTO_DEPOSITO` · `UNIDAD_MEDIDA_DEPOSITO` · `MOTIVO_BAJA_DEPOSITO` · `TIPO_PRESTAMO_DEPOSITO` · `TIPO_INGRESO_FINANZAS` · `CATEGORIA_EGRESO_FINANZAS` · `TIPO_CUENTA_BANCARIA_FINANZAS` · `TIPO_DOCUMENTO_FINANZAS` · `MOTIVO_ANULACION_FINANZAS` · `TIPO_DOCUMENTO` · `CATEGORIA_DOCUMENTO` · `ESTADO_DOCUMENTO` · `NIVEL_CONFIDENCIALIDAD_DOCUMENTO` · `MOTIVO_ANULACION_DOCUMENTO` · `ARCHIVO_FISICO_DOCUMENTO` · `ESTADO_SOCIO_PROTECTOR` · `PERIODICIDAD_APORTE` · `MEDIO_PAGO_FINANZAS` · `TIPO_BENEFICIO_SOCIO` · `MOTIVO_NOTA_CREDITO_FINANZAS`

## Donde se usa

- **Pantallas:** `/dashboard/academia`, `/dashboard/academia/[id]`, `/dashboard/academia/cursos-externos`, `/dashboard/academia/instructores-externos`, `/dashboard/asistencia`, `/dashboard/asistencia/eventos`, `/dashboard/asistencia/eventos/[id]`, `/dashboard/asistencia/externos`, `/dashboard/asistencia/registro`, `/dashboard/asistencia/tolerancias`, `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/documentos`, `/dashboard/documentos/[id]`, `/dashboard/documentos/auditoria`, `/dashboard/documentos/expedientes`, `/dashboard/documentos/expedientes/[id]`, `/dashboard/documentos/listado`, `/dashboard/documentos/plantillas`, `/dashboard/documentos/vencimientos`, `/dashboard/equipos`, `/dashboard/equipos/[id]`, `/dashboard/equipos/categorias`, `/dashboard/finanzas`, `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores`, `/dashboard/finanzas/socios-protectores/[id]`, `/dashboard/guardias/[id]`, `/dashboard/organizacion/documentos`, `/dashboard/organizacion/parametros`, `/dashboard/personal/[id]`, `/dashboard/personal/nuevo`
- **Endpoints:** AportesController, BeneficiosSociosController, ConsultasAcademiaController, ConsultasCruzadasController, ConsultasDepositoController, ConsultasDocumentosController, ConsultasFinanzasController, CuotasController, DashboardAsistenciaController, DashboardDocumentosController, DashboardFinanzasController, DocumentosController, EquiposController, EvaluacionesAcademiaController, FojaServicioController, IdiomasController, InscripcionesAcademiaController, InspeccionesEstacionController, IntegracionFinanzasController, MovimientosDepositoController, MovimientosFinancierosController, ParametrosController, PlantillasController, ReportesAcademiaController, ReportesFinanzasController
- **Servicios:** AportesService, BeneficiosSociosService, ConsultasAcademiaService, ConsultasCruzadasService, ConsultasDepositoService, ConsultasDocumentosService, ConsultasFinanzasService, CuotasService, DashboardAsistenciaService, DashboardDocumentosService, DashboardFinanzasService, DocumentosService, EquiposService, EvaluacionesAcademiaService, FojaServicioService, IaToolsService, IdiomasService, InscripcionesAcademiaService, InspeccionesEstacionService, IntegracionFinanzasService, MovimientosDepositoService, MovimientosFinancierosService, ParametrosService, PlantillasService, ReportesAcademiaService, ReportesFinanzasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/parametro.entity.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `persisted_in` → [[table--organizacion-parametros|organizacion.parametros]]

## Referenciado por

- [[service--academia-consultas-academia|ConsultasAcademiaService]] `uses` →
- [[service--academia-evaluaciones-academia|EvaluacionesAcademiaService]] `uses` →
- [[service--academia-inscripciones-academia|InscripcionesAcademiaService]] `uses` →
- [[service--academia-reportes-academia|ReportesAcademiaService]] `uses` →
- [[service--deposito-consultas-deposito|ConsultasDepositoService]] `uses` →
- [[service--deposito-movimientos-deposito|MovimientosDepositoService]] `uses` →
- [[service--documentos-consultas-documentos|ConsultasDocumentosService]] `uses` →
- [[service--documentos-dashboard-documentos|DashboardDocumentosService]] `uses` →
- [[service--documentos-documentos|DocumentosService]] `uses` →
- [[service--documentos-plantillas|PlantillasService]] `uses` →
- [[service--equipos-equipos|EquiposService]] `uses` →
- [[service--finanzas-aportes|AportesService]] `uses` →
- [[service--finanzas-beneficios-socios|BeneficiosSociosService]] `uses` →
- [[service--finanzas-consultas-finanzas|ConsultasFinanzasService]] `uses` →
- [[service--finanzas-cuotas|CuotasService]] `uses` →
- [[service--finanzas-dashboard-finanzas|DashboardFinanzasService]] `uses` →
- [[service--finanzas-integracion-finanzas|IntegracionFinanzasService]] `uses` →
- [[service--finanzas-movimientos-financieros|MovimientosFinancierosService]] `uses` →
- [[service--finanzas-reportes-finanzas|ReportesFinanzasService]] `uses` →
- [[service--guardias-inspecciones-estacion|InspeccionesEstacionService]] `uses` →
- [[service--ia-ia-tools|IaToolsService]] `uses` →
- [[service--operaciones-dashboard-asistencia|DashboardAsistenciaService]] `uses` →
- [[service--organizacion-parametros|ParametrosService]] `uses` →
- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `uses` →
- [[service--personal-foja-servicio|FojaServicioService]] `uses` →
- [[service--personal-idiomas|IdiomasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
