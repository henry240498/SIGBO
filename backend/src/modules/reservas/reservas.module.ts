import { Module } from '@nestjs/common';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';

@Module({
  imports: [SeguridadModule],
  controllers: [ReservasController],
  providers: [ReservasService],
})
export class ReservasModule {}
