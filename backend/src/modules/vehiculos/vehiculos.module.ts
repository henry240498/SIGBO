import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehiculo, VehiculoAutorizado } from '../../shared/entities';
import { VehiculosService } from './vehiculos.service';
import { VehiculosController } from './vehiculos.controller';
import { VehiculosAutorizadosService } from './vehiculos-autorizados.service';
import { VehiculosAutorizadosController } from './vehiculos-autorizados.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Vehiculo, VehiculoAutorizado])],
  controllers: [VehiculosController, VehiculosAutorizadosController],
  providers: [VehiculosService, VehiculosAutorizadosService],
  exports: [VehiculosService],
})
export class VehiculosModule {}
