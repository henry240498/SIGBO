import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AcuerdoAporte,
  AplicacionBeneficio,
  Aporte,
  Bombero,
  Caja,
  Cargo,
  BeneficioSocio,
  Cuota,
  CuentaBancaria,
  Designacion,
  DocumentoRespaldo,
  EjercicioFiscal,
  EntradaDeposito,
  Factura,
  IdentidadInstitucional,
  MovimientoBancario,
  MovimientoFinanciero,
  NotaCredito,
  NumeracionComprobante,
  OrdenPago,
  Parametro,
  Presupuesto,
  ProveedorDeposito,
  Rango,
  SocioHistorialCodigo,
  SocioProtector,
  TurnoCaja,
} from '../../shared/entities';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { EjerciciosFiscalesService } from './ejercicios-fiscales.service';
import { EjerciciosFiscalesController } from './ejercicios-fiscales.controller';
import { CajasService } from './cajas.service';
import { CajasController } from './cajas.controller';
import { CuentasBancariasService } from './cuentas-bancarias.service';
import { CuentasBancariasController } from './cuentas-bancarias.controller';
import { MovimientosFinancierosService } from './movimientos-financieros.service';
import { MovimientosFinancierosController } from './movimientos-financieros.controller';
import { CuotasService } from './cuotas.service';
import { CuotasController } from './cuotas.controller';
import { MovimientosBancariosService } from './movimientos-bancarios.service';
import { MovimientosBancariosController } from './movimientos-bancarios.controller';
import { PresupuestosService } from './presupuestos.service';
import { PresupuestosController } from './presupuestos.controller';
import { OrdenesPagoService } from './ordenes-pago.service';
import { OrdenesPagoController } from './ordenes-pago.controller';
import { DashboardFinanzasService } from './dashboard-finanzas.service';
import { DashboardFinanzasController } from './dashboard-finanzas.controller';
import { IntegracionFinanzasService } from './integracion-finanzas.service';
import { IntegracionFinanzasController } from './integracion-finanzas.controller';
import { ConsultasFinanzasService } from './consultas-finanzas.service';
import { ConsultasFinanzasController } from './consultas-finanzas.controller';
import { ReportesFinanzasService } from './reportes-finanzas.service';
import { ReportesFinanzasController } from './reportes-finanzas.controller';
import { SociosProtectoresService } from './socios-protectores.service';
import { SociosProtectoresController } from './socios-protectores.controller';
import { AcuerdosAporteService } from './acuerdos-aporte.service';
import { AcuerdosAporteController } from './acuerdos-aporte.controller';
import { AportesService } from './aportes.service';
import { AportesController } from './aportes.controller';
import { BeneficiosSociosService } from './beneficios-socios.service';
import { BeneficiosSociosController } from './beneficios-socios.controller';
import { FacturasService } from './facturas.service';
import { FacturasController } from './facturas.controller';
import { NotasCreditoService } from './notas-credito.service';
import { NotasCreditoController } from './notas-credito.controller';
import { NumeracionesComprobantesService } from './numeraciones-comprobantes.service';
import { NumeracionesComprobantesController } from './numeraciones-comprobantes.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EjercicioFiscal,
      Caja,
      TurnoCaja,
      CuentaBancaria,
      MovimientoFinanciero,
      DocumentoRespaldo,
      Cuota,
      MovimientoBancario,
      Presupuesto,
      OrdenPago,
      SocioProtector,
      SocioHistorialCodigo,
      AcuerdoAporte,
      Aporte,
      BeneficioSocio,
      AplicacionBeneficio,
      Factura,
      NotaCredito,
      NumeracionComprobante,
      // Entidades de otros modulos que Finanzas consulta/referencia
      // directamente (mismo patron de bajo acoplamiento ya usado en
      // Deposito/Academia/Guardias): nunca se duplican sus estructuras.
      Parametro,
      Bombero,
      ProveedorDeposito,
      EntradaDeposito,
      IdentidadInstitucional,
      Cargo,
      Designacion,
      Rango,
    ]),
    SeguridadModule,
  ],
  controllers: [
    EjerciciosFiscalesController,
    CajasController,
    CuentasBancariasController,
    MovimientosFinancierosController,
    CuotasController,
    MovimientosBancariosController,
    PresupuestosController,
    OrdenesPagoController,
    SociosProtectoresController,
    AcuerdosAporteController,
    AportesController,
    BeneficiosSociosController,
    FacturasController,
    NotasCreditoController,
    NumeracionesComprobantesController,
    DashboardFinanzasController,
    IntegracionFinanzasController,
    ConsultasFinanzasController,
    ReportesFinanzasController,
  ],
  providers: [
    EjerciciosFiscalesService,
    CajasService,
    CuentasBancariasService,
    MovimientosFinancierosService,
    CuotasService,
    MovimientosBancariosService,
    PresupuestosService,
    OrdenesPagoService,
    SociosProtectoresService,
    AcuerdosAporteService,
    AportesService,
    BeneficiosSociosService,
    FacturasService,
    NotasCreditoService,
    NumeracionesComprobantesService,
    DashboardFinanzasService,
    IntegracionFinanzasService,
    ConsultasFinanzasService,
    ReportesFinanzasService,
  ],
  exports: [BeneficiosSociosService],
})
export class FinanzasModule {}
