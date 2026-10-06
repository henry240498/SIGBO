import { Module } from '@nestjs/common';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { AdjuntosService } from './adjuntos.service';
import { AusenciasService } from './ausencias.service';
import { CampoController } from './campo.controller';
import { VictimasService } from './victimas.service';

@Module({
  imports: [SeguridadModule],
  controllers: [CampoController],
  providers: [AdjuntosService, AusenciasService, VictimasService],
  exports: [AusenciasService, VictimasService],
})
export class CampoModule {}
