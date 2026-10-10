import { Module } from '@nestjs/common';
import { AlertasModule } from '../alertas/alertas.module';
import { AppMovilModule } from '../app-movil/app-movil.module';
import { ControlPersonalModule } from '../control-personal/control-personal.module';
import { DespachoModule } from '../despacho/despacho.module';
import { GreModule } from '../gre/gre.module';
import { IaModule } from '../ia/ia.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { RespaldosService } from './respaldos.service';
import { SistemaController } from './sistema.controller';
import { SistemaService } from './sistema.service';

@Module({
  imports: [SeguridadModule, GreModule, ControlPersonalModule, DespachoModule, AlertasModule, IaModule, AppMovilModule],
  controllers: [SistemaController],
  providers: [SistemaService, RespaldosService],
  exports: [SistemaService],
})
export class SistemaModule {}
