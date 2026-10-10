import { Module } from '@nestjs/common';
import { AlertasModule } from '../alertas/alertas.module';
import { ConfiguracionModule } from '../configuracion/configuracion.module';
import { ControlPersonalModule } from '../control-personal/control-personal.module';
import { DenunciasModule } from '../denuncias/denuncias.module';
import { DespachoModule } from '../despacho/despacho.module';
import { FlotaModule } from '../flota/flota.module';
import { ReservasModule } from '../reservas/reservas.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { SistemaModule } from '../sistema/sistema.module';
import { CentroMandoController } from './centro-mando.controller';
import { CentroMandoService } from './centro-mando.service';

@Module({
  imports: [SeguridadModule, ConfiguracionModule, DespachoModule, AlertasModule, FlotaModule, DenunciasModule, ReservasModule, ControlPersonalModule, SistemaModule],
  controllers: [CentroMandoController],
  providers: [CentroMandoService],
})
export class CentroMandoModule {}
