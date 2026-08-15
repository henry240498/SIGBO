import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Articulo,
  BajaDeposito,
  Bombero,
  CategoriaArticulo,
  Cuartel,
  EntradaDeposito,
  EntradaDepositoItem,
  Equipo,
  IncidenciaDeposito,
  InventarioFisicoDeposito,
  InventarioFisicoItemDeposito,
  LoteArticulo,
  MantenimientoDeposito,
  MovimientoDeposito,
  Parametro,
  PrestamoDeposito,
  PrestamoDepositoItem,
  ProveedorDeposito,
  Servicio,
  TenenciaDeposito,
  UbicacionDeposito,
  Vehiculo,
} from '../../shared/entities';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { CategoriasArticuloService } from './categorias-articulo.service';
import { CategoriasArticuloController } from './categorias-articulo.controller';
import { UbicacionesDepositoService } from './ubicaciones-deposito.service';
import { UbicacionesDepositoController } from './ubicaciones-deposito.controller';
import { MovimientosDepositoService } from './movimientos-deposito.service';
import { MovimientosDepositoController } from './movimientos-deposito.controller';
import { ArticulosService } from './articulos.service';
import { ArticulosController } from './articulos.controller';
import { ProveedoresService } from './proveedores.service';
import { ProveedoresController } from './proveedores.controller';
import { EntradasService } from './entradas.service';
import { EntradasController } from './entradas.controller';
import { BajasService } from './bajas.service';
import { BajasController } from './bajas.controller';
import { PrestamosService } from './prestamos.service';
import { PrestamosController } from './prestamos.controller';
import { IntegracionDepositoService } from './integracion-deposito.service';
import { IntegracionDepositoController } from './integracion-deposito.controller';
import { InventariosFisicosService } from './inventarios-fisicos.service';
import { InventariosFisicosController } from './inventarios-fisicos.controller';
import { IncidenciasService } from './incidencias.service';
import { IncidenciasController } from './incidencias.controller';
import { MantenimientosService } from './mantenimientos.service';
import { MantenimientosController } from './mantenimientos.controller';
import { LotesArticuloService } from './lotes-articulo.service';
import { LotesArticuloController } from './lotes-articulo.controller';
import { AlertasDepositoService } from './alertas-deposito.service';
import { AlertasDepositoController } from './alertas-deposito.controller';
import { DashboardDepositoService } from './dashboard-deposito.service';
import { DashboardDepositoController } from './dashboard-deposito.controller';
import { ConsultasDepositoService } from './consultas-deposito.service';
import { ConsultasDepositoController } from './consultas-deposito.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CategoriaArticulo,
      Articulo,
      LoteArticulo,
      UbicacionDeposito,
      TenenciaDeposito,
      MovimientoDeposito,
      ProveedorDeposito,
      EntradaDeposito,
      EntradaDepositoItem,
      BajaDeposito,
      PrestamoDeposito,
      PrestamoDepositoItem,
      InventarioFisicoDeposito,
      InventarioFisicoItemDeposito,
      IncidenciaDeposito,
      MantenimientoDeposito,
      // Entidades de otros modulos que Deposito consulta/referencia
      // directamente (mismo patron de bajo acoplamiento ya usado en
      // Academia/Guardias): nunca se duplican sus estructuras.
      Equipo,
      Bombero,
      Vehiculo,
      Servicio,
      Cuartel,
      Parametro,
    ]),
    SeguridadModule,
  ],
  controllers: [
    CategoriasArticuloController,
    UbicacionesDepositoController,
    ArticulosController,
    MovimientosDepositoController,
    ProveedoresController,
    EntradasController,
    BajasController,
    PrestamosController,
    IntegracionDepositoController,
    InventariosFisicosController,
    IncidenciasController,
    MantenimientosController,
    LotesArticuloController,
    AlertasDepositoController,
    DashboardDepositoController,
    ConsultasDepositoController,
  ],
  providers: [
    CategoriasArticuloService,
    UbicacionesDepositoService,
    MovimientosDepositoService,
    ArticulosService,
    ProveedoresService,
    EntradasService,
    BajasService,
    PrestamosService,
    IntegracionDepositoService,
    InventariosFisicosService,
    IncidenciasService,
    MantenimientosService,
    LotesArticuloService,
    AlertasDepositoService,
    DashboardDepositoService,
    ConsultasDepositoService,
  ],
  exports: [MovimientosDepositoService],
})
export class DepositoModule {}
