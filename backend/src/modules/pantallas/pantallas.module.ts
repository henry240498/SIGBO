import { Module } from '@nestjs/common';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { NavegacionService } from './navegacion.service';
import { NavegacionController, PantallasController } from './pantallas.controller';
import { PantallasService } from './pantallas.service';

@Module({
  imports: [SeguridadModule],
  controllers: [PantallasController, NavegacionController],
  providers: [PantallasService, NavegacionService],
  exports: [PantallasService, NavegacionService],
})
export class PantallasModule {}
