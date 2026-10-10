import { Module } from '@nestjs/common';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { ControlPersonalController } from './control-personal.controller';
import { AvisosVencimientoService } from './avisos-vencimiento.service';
import { FichajeService } from './fichaje.service';
import { HorasServicioService } from './horas-servicio.service';
import { VencimientosService } from './vencimientos.service';

@Module({
  imports: [SeguridadModule],
  controllers: [ControlPersonalController],
  providers: [VencimientosService, HorasServicioService, FichajeService, AvisosVencimientoService],
  exports: [AvisosVencimientoService, VencimientosService],
})
export class ControlPersonalModule {}
