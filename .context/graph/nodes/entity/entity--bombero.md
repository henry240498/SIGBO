---
id: entity--bombero
tipo: ENTITY
nombre: Bombero
nivel: L1
dominio: personal
resumen: Entidad Bombero, persistida en personal.bomberos.
tabla: personal.bomberos
archivos:
  - backend/src/shared/entities/bombero.entity.ts
edges:
  - [belongs_to, domain--personal]
  - [persisted_in, table--personal-bomberos]
terminos: [bombero, bomberos, personal, estado, aspirante, activo, suspendido, licencia, retirado, fallecido, honorario, condicion, institucional, incorporado, combatiente, apoyo, economico]
---

# Bombero

Entidad Bombero, persistida en personal.bomberos.

- **Tabla:** [[table--personal-bomberos|personal.bomberos]]
- **Columnas mapeadas:** 60

## Estados y enumeraciones

- `EstadoBombero`: `ASPIRANTE` · `ACTIVO` · `SUSPENDIDO` · `LICENCIA` · `RETIRADO` · `FALLECIDO` · `HONORARIO`
- `CondicionInstitucional`: `INCORPORADO` · `COMBATIENTE` · `APOYO_ECONOMICO` · `HONORARIO`

## Donde se usa

- **Pantallas:** `/`, `/dashboard/academia`, `/dashboard/academia/[id]`, `/dashboard/academia/cursos-externos`, `/dashboard/academia/instructores-externos`, `/dashboard/asistencia`, `/dashboard/asistencia/eventos`, `/dashboard/asistencia/eventos/[id]`, `/dashboard/asistencia/externos`, `/dashboard/asistencia/registro`, `/dashboard/asistencia/tolerancias`, `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/documentos`, `/dashboard/documentos/[id]`, `/dashboard/documentos/auditoria`, `/dashboard/documentos/expedientes`, `/dashboard/documentos/expedientes/[id]`, `/dashboard/documentos/listado`, `/dashboard/documentos/plantillas`, `/dashboard/documentos/vencimientos`, `/dashboard/finanzas`, `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores`, `/dashboard/finanzas/socios-protectores/[id]`, `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/planificacion`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/ascensos`, `/dashboard/organizacion/designaciones`, `/dashboard/organizacion/documentos`, `/dashboard/organizacion/feriados`, `/dashboard/publicaciones`, `/dashboard/servicios`, `/dashboard/servicios/nuevo`
- **Endpoints:** ActividadProfesionalController, ActividadesAcademicasController, AscensosController, BitacoraController, BomberosController, CertificacionesAcademiaController, CondicionController, ConsultasAcademiaController, DesignacionesController, EspecialidadesBomberoController, EvaluacionesAcademiaController, EventosAsistenciaController, FirmasDocumentoController, FojaServicioController, GruposGuardiaController, GuardiasController, HistorialInstitucionalController, IdiomasController, ImportacionesController, InscripcionesAcademiaController, IntegracionDepositoController, MarcacionesController, NovedadesController, OrdenesGuardiaController, PernoctesController, PlantillasController, PublicacionesController, ReportesAcademiaController, ReportesFinanzasController, SegurosBomberoController, ServiciosController, SociosProtectoresController, SorteosController
- **Servicios:** ActividadProfesionalService, ActividadesAcademicasService, AscensosService, BitacoraService, BomberosService, CertificacionesAcademiaService, CondicionService, ConsultasAcademiaService, DesignacionesService, ElegibilidadService, EspecialidadesBomberoService, EvaluacionesAcademiaService, EventosAsistenciaService, FirmasDocumentoService, FojaServicioService, GeneracionService, GruposGuardiaService, GuardiasService, HistorialInstitucionalService, IaToolsService, IdiomasService, ImportacionesService, InscripcionesAcademiaService, IntegracionDepositoService, MarcacionesService, NovedadesService, OrdenesGuardiaService, PernoctesService, PlantillasService, PublicacionesService, ReportesAcademiaService, ReportesFinanzasService, SegurosBomberoService, ServiciosService, SociosProtectoresService, SorteosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/bombero.entity.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `persisted_in` → [[table--personal-bomberos|personal.bomberos]]

## Referenciado por

- [[service--academia-actividades-academicas|ActividadesAcademicasService]] `uses` →
- [[service--academia-certificaciones-academia|CertificacionesAcademiaService]] `uses` →
- [[service--academia-consultas-academia|ConsultasAcademiaService]] `uses` →
- [[service--academia-evaluaciones-academia|EvaluacionesAcademiaService]] `uses` →
- [[service--academia-inscripciones-academia|InscripcionesAcademiaService]] `uses` →
- [[service--academia-reportes-academia|ReportesAcademiaService]] `uses` →
- [[service--deposito-integracion-deposito|IntegracionDepositoService]] `uses` →
- [[service--documentos-firmas-documento|FirmasDocumentoService]] `uses` →
- [[service--documentos-plantillas|PlantillasService]] `uses` →
- [[service--finanzas-reportes-finanzas|ReportesFinanzasService]] `uses` →
- [[service--finanzas-socios-protectores|SociosProtectoresService]] `uses` →
- [[service--guardias-bitacora|BitacoraService]] `uses` →
- [[service--guardias-elegibilidad|ElegibilidadService]] `uses` →
- [[service--guardias-generacion|GeneracionService]] `uses` →
- [[service--guardias-grupos-guardia|GruposGuardiaService]] `uses` →
- [[service--guardias-guardias|GuardiasService]] `uses` →
- [[service--guardias-novedades|NovedadesService]] `uses` →
- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `uses` →
- [[service--guardias-pernoctes|PernoctesService]] `uses` →
- [[service--guardias-sorteos|SorteosService]] `uses` →
- [[service--ia-ia-tools|IaToolsService]] `uses` →
- [[service--operaciones-eventos-asistencia|EventosAsistenciaService]] `uses` →
- [[service--operaciones-importaciones|ImportacionesService]] `uses` →
- [[service--operaciones-marcaciones|MarcacionesService]] `uses` →
- [[service--organizacion-ascensos|AscensosService]] `uses` →
- [[service--organizacion-designaciones|DesignacionesService]] `uses` →
- [[service--personal-actividad-profesional|ActividadProfesionalService]] `uses` →
- [[service--personal-bomberos|BomberosService]] `uses` →
- [[service--personal-condicion|CondicionService]] `uses` →
- [[service--personal-especialidades-bombero|EspecialidadesBomberoService]] `uses` →
- [[service--personal-foja-servicio|FojaServicioService]] `uses` →
- [[service--personal-historial-institucional|HistorialInstitucionalService]] `uses` →
- [[service--personal-idiomas|IdiomasService]] `uses` →
- [[service--personal-seguros-bombero|SegurosBomberoService]] `uses` →
- [[service--publicaciones-publicaciones|PublicacionesService]] `uses` →
- [[service--servicios-servicios|ServiciosService]] `uses` →
- [[rule--cedula-y-numero-bombero-unicos|Cedula y numero de bombero son unicos en toda la institucion]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
