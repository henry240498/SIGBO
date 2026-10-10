import { Module } from '@nestjs/common';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { DisponibilidadService } from './disponibilidad.service';
import { DotacionService } from './dotacion.service';
import { FlotaController } from './flota.controller';
import { FlotaService } from './flota.service';
import { InformeService } from './informe.service';

@Module({
  imports: [SeguridadModule],
  controllers: [FlotaController],
  providers: [FlotaService, DotacionService, DisponibilidadService, InformeService],
  exports: [FlotaService, DisponibilidadService],
})
export class FlotaModule {}
