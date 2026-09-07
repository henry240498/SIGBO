---
id: service--seguridad-auditoria
tipo: SERVICE
nombre: AuditoriaService
nivel: L2
dominio: seguridad
resumen: Logica de negocio de auditoria (modulo seguridad).
capa: backend
archivos:
  - backend/src/modules/seguridad/auditoria.service.ts
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--modulo-seguridad]
  - [uses, entity--log-auditoria]
  - [reads, table--seguridad-logs-auditoria]
terminos: [auditoria, seguridad, log]
---

# AuditoriaService

Logica de negocio de auditoria (modulo seguridad).


## Metodos

`registrar()` · `findAll()` · `findRecientes()` · `findPorUsuario()`

## Archivos

- `backend/src/modules/seguridad/auditoria.service.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--modulo-seguridad|seguridad (modulo NestJS)]]
- `uses` → [[entity--log-auditoria|LogAuditoria]]
- `reads` → [[table--seguridad-logs-auditoria|seguridad.logs_auditoria]]

## Referenciado por

- [[service--academia-actividades-academicas|ActividadesAcademicasService]] `uses` →
- [[service--academia-certificaciones-academia|CertificacionesAcademiaService]] `uses` →
- [[service--academia-evaluaciones-academia|EvaluacionesAcademiaService]] `uses` →
- [[service--academia-inscripciones-academia|InscripcionesAcademiaService]] `uses` →
- [[service--academia-sesiones-academia|SesionesAcademiaService]] `uses` →
- [[service--auth-auth|AuthService]] `uses` →
- [[service--configuracion-configuracion|ConfiguracionService]] `uses` →
- [[service--denuncias-denuncias|DenunciasService]] `uses` →
- [[service--deposito-articulos|ArticulosService]] `uses` →
- [[service--deposito-bajas|BajasService]] `uses` →
- [[service--deposito-categorias-articulo|CategoriasArticuloService]] `uses` →
- [[service--deposito-entradas|EntradasService]] `uses` →
- [[service--deposito-incidencias|IncidenciasService]] `uses` →
- [[service--deposito-inventarios-fisicos|InventariosFisicosService]] `uses` →
- [[service--deposito-lotes-articulo|LotesArticuloService]] `uses` →
- [[service--deposito-mantenimientos|MantenimientosService]] `uses` →
- [[service--deposito-movimientos-deposito|MovimientosDepositoService]] `uses` →
- [[service--deposito-prestamos|PrestamosService]] `uses` →
- [[service--deposito-proveedores|ProveedoresService]] `uses` →
- [[service--deposito-ubicaciones-deposito|UbicacionesDepositoService]] `uses` →
- [[service--documentos-documentos|DocumentosService]] `uses` →
- [[service--documentos-expedientes|ExpedientesService]] `uses` →
- [[service--documentos-firmas-documento|FirmasDocumentoService]] `uses` →
- [[service--documentos-plantillas|PlantillasService]] `uses` →
- [[service--finanzas-acuerdos-aporte|AcuerdosAporteService]] `uses` →
- [[service--finanzas-aportes|AportesService]] `uses` →
- [[service--finanzas-beneficios-socios|BeneficiosSociosService]] `uses` →
- [[service--finanzas-cajas|CajasService]] `uses` →
- [[service--finanzas-cuentas-bancarias|CuentasBancariasService]] `uses` →
- [[service--finanzas-cuotas|CuotasService]] `uses` →
- [[service--finanzas-ejercicios-fiscales|EjerciciosFiscalesService]] `uses` →
- [[service--finanzas-facturas|FacturasService]] `uses` →
- [[service--finanzas-movimientos-bancarios|MovimientosBancariosService]] `uses` →
- [[service--finanzas-movimientos-financieros|MovimientosFinancierosService]] `uses` →
- [[service--finanzas-notas-credito|NotasCreditoService]] `uses` →
- [[service--finanzas-numeraciones-comprobantes|NumeracionesComprobantesService]] `uses` →
- [[service--finanzas-ordenes-pago|OrdenesPagoService]] `uses` →
- [[service--finanzas-presupuestos|PresupuestosService]] `uses` →
- [[service--finanzas-socios-protectores|SociosProtectoresService]] `uses` →
- [[service--guardias-bitacora|BitacoraService]] `uses` →
- [[service--guardias-generacion|GeneracionService]] `uses` →
- [[service--guardias-grupos-guardia|GruposGuardiaService]] `uses` →
- [[service--guardias-guardias|GuardiasService]] `uses` →
- [[service--guardias-inspecciones-estacion|InspeccionesEstacionService]] `uses` →
- [[service--guardias-inspecciones-movil|InspeccionesMovilService]] `uses` →
- [[service--guardias-novedades|NovedadesService]] `uses` →
- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `uses` →
- [[service--guardias-pernoctes|PernoctesService]] `uses` →
- [[service--guardias-requisitos-rol|RequisitosRolService]] `uses` →
- [[service--guardias-sorteos|SorteosService]] `uses` →
- [[service--ia-ia-configuracion|IaConfiguracionService]] `uses` →
- [[service--ia-ia-conversaciones|IaConversacionesService]] `uses` →
- [[service--ia-ia-propuestas-mejora|IaPropuestasMejoraService]] `uses` →
- [[service--operaciones-eventos-asistencia|EventosAsistenciaService]] `uses` →
- [[service--operaciones-importaciones|ImportacionesService]] `uses` →
- [[service--operaciones-marcaciones|MarcacionesService]] `uses` →
- [[service--organizacion-feriados|FeriadosService]] `uses` →
- [[service--personal-bomberos|BomberosService]] `uses` →
- [[service--seguridad-dashboard|DashboardService]] `uses` →
- [[service--seguridad-permisos|PermisosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
