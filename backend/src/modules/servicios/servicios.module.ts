import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Bombero,
  ComunicacionServicio,
  Cuartel,
  HistorialServicio,
  LogAuditoria,
  PruebaComunicacionServicio,
  RutaPlanificadaServicio,
  Servicio,
  TipoServicio,
  Vehiculo,
} from '../../shared/entities';
import { ServiciosController } from './servicios.controller';
import { ServiciosService } from './servicios.service';
import { SeguimientoGeograficoController } from './seguimiento/seguimiento-geografico.controller';
import { SeguimientoGeograficoService } from './seguimiento/seguimiento-geografico.service';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { DocumentosModule } from '../documentos/documentos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Servicio, TipoServicio, ComunicacionServicio, LogAuditoria, Bombero, Vehiculo,
      Cuartel, HistorialServicio, RutaPlanificadaServicio, PruebaComunicacionServicio,
    ]),
    SeguridadModule,
    DocumentosModule,
  ],
  controllers: [ServiciosController, SeguimientoGeograficoController],
  providers: [ServiciosService, SeguimientoGeograficoService],
})
export class ServiciosModule {}
