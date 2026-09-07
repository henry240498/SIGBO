---
id: component--modulo-finanzas
tipo: COMPONENT
nombre: finanzas (modulo NestJS)
nivel: L1
dominio: finanzas
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de finanzas.
capa: backend
archivos:
  - backend/src/modules/finanzas/finanzas.module.ts
edges:
  - [belongs_to, domain--finanzas]
terminos: [finanzas, modulo]
---

# finanzas (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de finanzas.


## Entidades registradas (forFeature)

EjercicioFiscal, Caja, TurnoCaja, CuentaBancaria, MovimientoFinanciero, DocumentoRespaldo, Cuota, MovimientoBancario, Presupuesto, OrdenPago, SocioProtector, SocioHistorialCodigo, AcuerdoAporte, Aporte, BeneficioSocio, AplicacionBeneficio, Factura, NotaCredito, NumeracionComprobante, // Entidades de otros modulos que Finanzas consulta/referencia
      // directamente (mismo patron de bajo acoplamiento ya usado en
      // Deposito/Academia/Guardias): nunca se duplican sus estructuras.
      Parametro, Bombero, ProveedorDeposito, EntradaDeposito, IdentidadInstitucional, Cargo, Designacion, Rango

## Archivos

- `backend/src/modules/finanzas/finanzas.module.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]

## Referenciado por

- [[service--finanzas-acuerdos-aporte|AcuerdosAporteService]] `uses` →
- [[service--finanzas-aportes|AportesService]] `uses` →
- [[service--finanzas-beneficios-socios|BeneficiosSociosService]] `uses` →
- [[service--finanzas-cajas|CajasService]] `uses` →
- [[service--finanzas-consultas-finanzas|ConsultasFinanzasService]] `uses` →
- [[service--finanzas-cuentas-bancarias|CuentasBancariasService]] `uses` →
- [[service--finanzas-cuotas|CuotasService]] `uses` →
- [[service--finanzas-dashboard-finanzas|DashboardFinanzasService]] `uses` →
- [[service--finanzas-ejercicios-fiscales|EjerciciosFiscalesService]] `uses` →
- [[service--finanzas-facturas|FacturasService]] `uses` →
- [[service--finanzas-integracion-finanzas|IntegracionFinanzasService]] `uses` →
- [[service--finanzas-movimientos-bancarios|MovimientosBancariosService]] `uses` →
- [[service--finanzas-movimientos-financieros|MovimientosFinancierosService]] `uses` →
- [[service--finanzas-notas-credito|NotasCreditoService]] `uses` →
- [[service--finanzas-numeraciones-comprobantes|NumeracionesComprobantesService]] `uses` →
- [[service--finanzas-ordenes-pago|OrdenesPagoService]] `uses` →
- [[service--finanzas-presupuestos|PresupuestosService]] `uses` →
- [[service--finanzas-reportes-finanzas|ReportesFinanzasService]] `uses` →
- [[service--finanzas-socios-protectores|SociosProtectoresService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
