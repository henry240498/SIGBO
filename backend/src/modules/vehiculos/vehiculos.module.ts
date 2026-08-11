import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ChecklistItemVehiculo,
  ConsumoCombustible,
  MantenimientoVehiculo,
  Servicio,
  Vehiculo,
  VehiculoAutorizado,
} from '../../shared/entities';
import { VehiculosService } from './vehiculos.service';
import { VehiculosController } from './vehiculos.controller';
import { VehiculosAutorizadosService } from './vehiculos-autorizados.service';
import { VehiculosAutorizadosController } from './vehiculos-autorizados.controller';
import { ChecklistItemsService } from './checklist-items.service';
import { ChecklistItemsController } from './checklist-items.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vehiculo,
      VehiculoAutorizado,
      MantenimientoVehiculo,
      ConsumoCombustible,
      ChecklistItemVehiculo,
      Servicio,
    ]),
  ],
  controllers: [VehiculosController, VehiculosAutorizadosController, ChecklistItemsController],
  providers: [VehiculosService, VehiculosAutorizadosService, ChecklistItemsService],
  exports: [VehiculosService],
})
export class VehiculosModule {}
