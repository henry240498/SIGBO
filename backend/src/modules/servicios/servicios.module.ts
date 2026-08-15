import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bombero, ComunicacionServicio, LogAuditoria, Servicio, TipoServicio, Vehiculo } from '../../shared/entities';
import { ServiciosController } from './servicios.controller';
import { ServiciosService } from './servicios.service';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { DocumentosModule } from '../documentos/documentos.module';

@Module({
  imports: [TypeOrmModule.forFeature([Servicio, TipoServicio, ComunicacionServicio, LogAuditoria, Bombero, Vehiculo]), SeguridadModule, DocumentosModule],
  controllers: [ServiciosController],
  providers: [ServiciosService],
})
export class ServiciosModule {}
