import { Module } from '@nestjs/common';
import { PantallasModule } from '../pantallas/pantallas.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { DespachoController } from './despacho.controller';
import { DespachoService } from './despacho.service';
import { DespachoTiempoReal } from './despacho-tiempo-real.service';
import { ServicioActivoController } from './servicio-activo.controller';
import { ServicioActivoService } from './servicio-activo.service';

@Module({
  imports: [SeguridadModule, PantallasModule],
  controllers: [DespachoController, ServicioActivoController],
  providers: [DespachoService, DespachoTiempoReal, ServicioActivoService],
  exports: [DespachoService, DespachoTiempoReal, ServicioActivoService],
})
export class DespachoModule {}
