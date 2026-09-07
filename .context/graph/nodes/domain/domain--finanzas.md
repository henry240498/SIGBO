---
id: domain--finanzas
tipo: DOMAIN
nombre: Finanzas
nivel: L0
dominio: finanzas
estado: ACTIVO
resumen: "Modulo funcional \"Finanzas\". Habilitado en la navegacion."
archivos:
  - frontend/src/lib/modulos.ts
terminos: [finanzas]
---

# Finanzas

Modulo funcional "Finanzas". Habilitado en la navegacion.


## Archivos

- `frontend/src/lib/modulos.ts`

## Referenciado por

- [[entity--acuerdo-aporte|AcuerdoAporte]] `belongs_to` →
- [[entity--aplicacion-beneficio|AplicacionBeneficio]] `belongs_to` →
- [[entity--aporte|Aporte]] `belongs_to` →
- [[entity--beneficio-socio|BeneficioSocio]] `belongs_to` →
- [[entity--caja|Caja]] `belongs_to` →
- [[entity--cuenta-bancaria|CuentaBancaria]] `belongs_to` →
- [[entity--cuota|Cuota]] `belongs_to` →
- [[entity--documento-respaldo|DocumentoRespaldo]] `belongs_to` →
- [[entity--ejercicio-fiscal|EjercicioFiscal]] `belongs_to` →
- [[entity--factura|Factura]] `belongs_to` →
- [[entity--movimiento-bancario|MovimientoBancario]] `belongs_to` →
- [[entity--movimiento-financiero|MovimientoFinanciero]] `belongs_to` →
- [[entity--nota-credito|NotaCredito]] `belongs_to` →
- [[entity--numeracion-comprobante|NumeracionComprobante]] `belongs_to` →
- [[entity--orden-pago|OrdenPago]] `belongs_to` →
- [[entity--presupuesto|Presupuesto]] `belongs_to` →
- [[entity--socio-historial-codigo|SocioHistorialCodigo]] `belongs_to` →
- [[entity--socio-protector|SocioProtector]] `belongs_to` →
- [[entity--turno-caja|TurnoCaja]] `belongs_to` →
- [[table--finanzas-cuentas-contables|finanzas.cuentas_contables]] `belongs_to` →
- [[table--finanzas-movimientos|finanzas.movimientos]] `belongs_to` →
- [[table--finanzas-ejercicios-fiscales|finanzas.ejercicios_fiscales]] `belongs_to` →
- [[table--finanzas-cajas|finanzas.cajas]] `belongs_to` →
- [[table--finanzas-turnos-caja|finanzas.turnos_caja]] `belongs_to` →
- [[table--finanzas-cuentas-bancarias|finanzas.cuentas_bancarias]] `belongs_to` →
- [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]] `belongs_to` →
- [[table--finanzas-documentos-respaldo|finanzas.documentos_respaldo]] `belongs_to` →
- [[table--finanzas-cuotas|finanzas.cuotas]] `belongs_to` →
- [[table--finanzas-movimientos-bancarios|finanzas.movimientos_bancarios]] `belongs_to` →
- [[table--finanzas-presupuestos|finanzas.presupuestos]] `belongs_to` →
- [[table--finanzas-ordenes-pago|finanzas.ordenes_pago]] `belongs_to` →
- [[table--finanzas-socios-protectores|finanzas.socios_protectores]] `belongs_to` →
- [[table--finanzas-socios-historial-codigo|finanzas.socios_historial_codigo]] `belongs_to` →
- [[table--finanzas-acuerdos-aporte|finanzas.acuerdos_aporte]] `belongs_to` →
- [[table--finanzas-aportes|finanzas.aportes]] `belongs_to` →
- [[table--finanzas-beneficios-socios|finanzas.beneficios_socios]] `belongs_to` →
- [[table--finanzas-aplicaciones-beneficio|finanzas.aplicaciones_beneficio]] `belongs_to` →
- [[table--finanzas-numeraciones-comprobantes|finanzas.numeraciones_comprobantes]] `belongs_to` →
- [[table--finanzas-facturas|finanzas.facturas]] `belongs_to` →
- [[table--finanzas-notas-credito|finanzas.notas_credito]] `belongs_to` →
- [[component--modulo-finanzas|finanzas (modulo NestJS)]] `belongs_to` →
- [[service--finanzas-acuerdos-aporte|AcuerdosAporteService]] `belongs_to` →
- [[service--finanzas-aportes|AportesService]] `belongs_to` →
- [[service--finanzas-beneficios-socios|BeneficiosSociosService]] `belongs_to` →
- [[service--finanzas-cajas|CajasService]] `belongs_to` →
- [[service--finanzas-consultas-finanzas|ConsultasFinanzasService]] `belongs_to` →
- [[service--finanzas-cuentas-bancarias|CuentasBancariasService]] `belongs_to` →
- [[service--finanzas-cuotas|CuotasService]] `belongs_to` →
- [[service--finanzas-dashboard-finanzas|DashboardFinanzasService]] `belongs_to` →
- [[service--finanzas-ejercicios-fiscales|EjerciciosFiscalesService]] `belongs_to` →
- [[service--finanzas-facturas|FacturasService]] `belongs_to` →
- [[service--finanzas-integracion-finanzas|IntegracionFinanzasService]] `belongs_to` →
- [[service--finanzas-movimientos-bancarios|MovimientosBancariosService]] `belongs_to` →
- [[service--finanzas-movimientos-financieros|MovimientosFinancierosService]] `belongs_to` →
- [[service--finanzas-notas-credito|NotasCreditoService]] `belongs_to` →
- [[service--finanzas-numeraciones-comprobantes|NumeracionesComprobantesService]] `belongs_to` →
- [[service--finanzas-ordenes-pago|OrdenesPagoService]] `belongs_to` →
- [[service--finanzas-presupuestos|PresupuestosService]] `belongs_to` →
- [[service--finanzas-reportes-finanzas|ReportesFinanzasService]] `belongs_to` →
- [[service--finanzas-socios-protectores|SociosProtectoresService]] `belongs_to` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
