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
- [[service--alertas-alertas|AlertasService]] `uses` →
- [[service--auth-auth|AuthService]] `uses` →
- [[service--campo-adjuntos|AdjuntosService]] `uses` →
- [[service--campo-ausencias|AusenciasService]] `uses` →
- [[service--campo-victimas|VictimasService]] `uses` →
- [[service--cartografia-cartografia|CartografiaService]] `uses` →
- [[service--configuracion-configuracion|ConfiguracionService]] `uses` →
- [[service--control-personal-fichaje|FichajeService]] `uses` →
- [[service--control-personal-horas-servicio|HorasServicioService]] `uses` →
- [[service--control-personal-vencimientos|VencimientosService]] `uses` →
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
- [[service--despacho-despacho|DespachoService]] `uses` →
- [[service--despacho-servicio-activo|ServicioActivoService]] `uses` →
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
- [[service--flota-dotacion|DotacionService]] `uses` →
- [[service--flota-flota|FlotaService]] `uses` →
- [[service--flota-informe|InformeService]] `uses` →
- [[service--gre-gre-activacion|GreActivacionService]] `uses` →
- [[service--gre-gre-importacion|GreImportacionService]] `uses` →
- [[service--gre-gre-revision|GreRevisionService]] `uses` →
- [[service--guardias-bitacora|BitacoraService]] `uses` →
- [[service--guardias-generacion|GeneracionService]] `uses` →
- [[service--guardias-grupos-guardia|GruposGuardiaService]] `uses` →
- [[service--guardias-guardias|GuardiasService]] `uses` →
- [[service--guardias-inspecciones-estacion|InspeccionesEstacionService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
